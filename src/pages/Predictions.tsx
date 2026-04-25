import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Sparkles, Check, X, Edit, ShieldAlert } from "lucide-react";

interface Pred {
  id: string;
  product_id: string;
  suggested_quantity: number;
  confidence_score: number;
  model_version: string;
  explanation: string;
  is_safe_mode: boolean;
  status: string;
  created_at: string;
  product?: { sku: string; name: string; category: string } | null;
}

const Predictions = () => {
  const { toast } = useToast();
  const { canApprovePurchase } = useUserRoles();
  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState<Pred[]>([]);
  const [editOpen, setEditOpen] = useState<Pred | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editReason, setEditReason] = useState("");

  const load = async () => {
    const { data } = await supabase.from("demand_predictions")
      .select("*, product:products(sku, name, category)")
      .eq("status", tab).order("created_at", { ascending: false }) as any;
    setItems((data as Pred[]) ?? []);
  };
  useEffect(() => { load(); }, [tab]);

  const decide = async (pred: Pred, decision: "approved" | "rejected" | "edited", finalQty?: number, reason?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("demand_predictions").update({ status: decision }).eq("id", pred.id);
    await supabase.from("ai_suggestion_decisions").insert({
      prediction_id: pred.id, decided_by: user.id, decision,
      final_quantity: finalQty ?? pred.suggested_quantity,
      human_reason: reason ?? null
    });
    await supabase.from("audit_logs").insert({
      actor_user_id: user.id, action: `prediction_${decision}`, entity_type: "demand_predictions", entity_id: pred.id,
      readable_description: `${decision === "approved" ? "Aprovou" : decision === "rejected" ? "Rejeitou" : "Editou"} sugestão de ${pred.product?.name} (${pred.suggested_quantity} → ${finalQty ?? pred.suggested_quantity}). ${reason ?? ""}`
    });
    toast({ title: "Decisão registrada ✅" });
    setEditOpen(null); load();
  };

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        <header>
          <h2 className="text-3xl font-extrabold font-headline flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" /> Sugestões da IA
          </h2>
          <p className="text-muted-foreground">Cada sugestão inclui confiança, justificativa e versão do modelo. Aprovação humana é obrigatória.</p>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="approved">Aprovadas</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
            <TabsTrigger value="edited">Editadas</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-3 mt-4">
            {items.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhuma sugestão.</CardContent></Card>
            ) : items.map(p => (
              <Card key={p.id} className={p.is_safe_mode ? "border-tertiary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{p.product?.name ?? "Produto"}</CardTitle>
                      <p className="text-xs text-muted-foreground">SKU {p.product?.sku} · {p.product?.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {p.is_safe_mode && (
                        <Badge variant="outline" className="border-tertiary text-tertiary">
                          <ShieldAlert className="w-3 h-3 mr-1" />Modo Seguro
                        </Badge>
                      )}
                      <Badge variant={p.confidence_score >= 80 ? "default" : "secondary"}>
                        Confiança {Number(p.confidence_score).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><p className="text-muted-foreground">Sugestão</p><p className="text-2xl font-bold">{p.suggested_quantity}</p></div>
                    <div><p className="text-muted-foreground">Modelo</p><p className="font-mono text-xs">{p.model_version}</p></div>
                    <div><p className="text-muted-foreground">Gerada em</p><p className="text-xs">{new Date(p.created_at).toLocaleString("pt-BR")}</p></div>
                  </div>
                  <div className="bg-muted/50 rounded p-3 text-sm">
                    <p className="font-semibold mb-1">Justificativa</p>
                    <p className="text-muted-foreground">{p.explanation}</p>
                  </div>
                  {tab === "pending" && canApprovePurchase && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => decide(p, "approved")}><Check className="w-4 h-4 mr-1" />Aprovar</Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditOpen(p); setEditQty(String(p.suggested_quantity)); }}><Edit className="w-4 h-4 mr-1" />Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => decide(p, "rejected", undefined, "Rejeitada pelo comprador")}><X className="w-4 h-4 mr-1" />Rejeitar</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Dialog open={!!editOpen} onOpenChange={o => !o && setEditOpen(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar sugestão</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><label className="text-sm font-medium">Quantidade final</label><Input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Motivo da alteração</label><Textarea value={editReason} onChange={e => setEditReason(e.target.value)} placeholder="Ex.: promoção local não capturada pelo modelo" /></div>
              <Button onClick={() => editOpen && decide(editOpen, "edited", Number(editQty), editReason)} className="w-full">Confirmar edição</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Predictions;
