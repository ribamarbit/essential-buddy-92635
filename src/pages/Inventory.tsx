import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Plus, Search, Sparkles } from "lucide-react";

interface Row {
  id: string;
  current_quantity: number;
  minimum_stock: number;
  location_code: string | null;
  product: { id: string; sku: string; name: string; category: string } | null;
}

const Inventory = () => {
  const { toast } = useToast();
  const { canManageProducts, canAdjustInventory, canApprovePurchase } = useUserRoles();
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [adjustOpen, setAdjustOpen] = useState<Row | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustType, setAdjustType] = useState<"adjustment" | "loss">("adjustment");
  const [adjustReason, setAdjustReason] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: "", name: "", category: "Geral", minimum_stock: "5" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("inventory_balances")
      .select("id, current_quantity, minimum_stock, location_code, product:products(id, sku, name, category)")
      .order("updated_at", { ascending: false }) as any;
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const categories = Array.from(new Set(rows.map(r => r.product?.category).filter(Boolean))) as string[];
  const filtered = rows.filter(r => {
    const matchSearch = !search || r.product?.name.toLowerCase().includes(search.toLowerCase()) || r.product?.sku.includes(search);
    const matchCat = category === "all" || r.product?.category === category;
    return matchSearch && matchCat;
  });

  const handleAdjust = async () => {
    if (!adjustOpen) return;
    const qty = Number(adjustQty);
    if (isNaN(qty) || qty === 0) return toast({ title: "Quantidade inválida", variant: "destructive" });
    const newQty = adjustType === "loss"
      ? Math.max(0, Number(adjustOpen.current_quantity) - Math.abs(qty))
      : Math.max(0, Number(adjustOpen.current_quantity) + qty);

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("inventory_balances").update({ current_quantity: newQty, updated_at: new Date().toISOString() }).eq("id", adjustOpen.id);
    await supabase.from("inventory_movements").insert({
      store_id: crypto.randomUUID(),
      product_id: adjustOpen.product!.id,
      movement_type: adjustType,
      quantity: qty,
      reason: adjustReason,
      performed_by: user?.id ?? null,
    });
    if (user) {
      await supabase.from("audit_logs").insert({
        actor_user_id: user.id, action: adjustType, entity_type: "inventory_balances", entity_id: adjustOpen.id,
        readable_description: `${adjustType === "loss" ? "Perda" : "Ajuste"} de ${qty} em ${adjustOpen.product?.name}. Motivo: ${adjustReason || "-"}`
      });
    }
    toast({ title: "Estoque atualizado ✅" });
    setAdjustOpen(null); setAdjustQty(""); setAdjustReason(""); load();
  };

  const handleNewProduct = async () => {
    if (!newProduct.sku || !newProduct.name) return toast({ title: "SKU e nome obrigatórios", variant: "destructive" });
    const { data: prod, error } = await supabase.from("products").insert({
      sku: newProduct.sku, name: newProduct.name, category: newProduct.category, minimum_shelf_life_days: 7
    }).select().single();
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    await supabase.from("inventory_balances").insert({
      product_id: prod.id, current_quantity: 0, minimum_stock: Number(newProduct.minimum_stock) || 0, location_code: "A1"
    });
    toast({ title: "Produto cadastrado ✅" });
    setNewOpen(false); setNewProduct({ sku: "", name: "", category: "Geral", minimum_stock: "5" }); load();
  };

  const handleGeneratePrediction = async (productId: string, name: string) => {
    toast({ title: "Gerando sugestão da IA…", description: name });
    const { data, error } = await supabase.functions.invoke("generate-prediction", { body: { product_id: productId } });
    if (error) return toast({ title: "Erro na IA", description: error.message, variant: "destructive" });
    toast({
      title: data?.safe_mode ? "Sugestão (Modo Seguro) ✅" : "Sugestão IA gerada ✅",
      description: "Veja em Sugestões da IA para aprovar."
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold font-headline">Inventário Ativo</h2>
            <p className="text-muted-foreground">Filtre, ajuste e gere sugestões de compra.</p>
          </div>
          {canManageProducts && (
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Cadastrar produto</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo produto</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>SKU</Label><Input value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} /></div>
                  <div><Label>Nome</Label><Input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} /></div>
                  <div><Label>Categoria</Label><Input value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} /></div>
                  <div><Label>Estoque mínimo</Label><Input type="number" value={newProduct.minimum_stock} onChange={e => setNewProduct({ ...newProduct, minimum_stock: e.target.value })} /></div>
                  <Button onClick={handleNewProduct} className="w-full">Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </header>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input placeholder="Buscar por SKU ou nome…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="md:w-56"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? <p className="text-muted-foreground">Carregando…</p> : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum produto. Cadastre o primeiro.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(row => {
              const critical = row.current_quantity <= row.minimum_stock;
              return (
                <Card key={row.id}>
                  <CardContent className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{row.product?.name}</p>
                        {critical && <Badge variant="destructive">crítico</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">SKU {row.product?.sku} · {row.product?.category} · loc. {row.location_code ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{row.current_quantity}</p>
                      <p className="text-xs text-muted-foreground">mín. {row.minimum_stock}</p>
                    </div>
                    <div className="flex gap-2">
                      {canAdjustInventory && (
                        <Button variant="outline" size="sm" onClick={() => setAdjustOpen(row)}>Ajustar</Button>
                      )}
                      {canApprovePurchase && row.product && (
                        <Button size="sm" onClick={() => handleGeneratePrediction(row.product!.id, row.product!.name)}>
                          <Sparkles className="w-3 h-3 mr-1" />IA
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!adjustOpen} onOpenChange={(o) => !o && setAdjustOpen(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Ajustar {adjustOpen?.product?.name}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Tipo</Label>
                <Select value={adjustType} onValueChange={(v: "adjustment" | "loss") => setAdjustType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adjustment">Ajuste (+/-)</SelectItem>
                    <SelectItem value="loss">Perda (vencimento, dano, furto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Quantidade</Label><Input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} /></div>
              <div><Label>Motivo</Label><Input value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Ex.: contagem física, vencimento" /></div>
              <Button onClick={handleAdjust} className="w-full">Confirmar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Inventory;
