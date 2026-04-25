import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, TrendingUp, Activity, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserRoles, ROLE_LABELS } from "@/hooks/useUserRoles";
import { migrateLocalItemsToProducts } from "@/utils/migrateLegacyData";
import { useToast } from "@/hooks/use-toast";

interface InventoryRow {
  id: string;
  current_quantity: number;
  minimum_stock: number;
  product: { id: string; sku: string; name: string; category: string } | null;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { roles } = useUserRoles();
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [pendingPredictions, setPendingPredictions] = useState(0);
  const [expiring, setExpiring] = useState(0);
  const [loading, setLoading] = useState(true);
  const [safeMode, setSafeMode] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await migrateLocalItemsToProducts();
      if (result.migrated > 0) {
        toast({ title: "Dados migrados ✅", description: `${result.migrated} itens convertidos em produtos com SKU.` });
      }
      await load();
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data: inv } = await supabase
      .from("inventory_balances")
      .select("id, current_quantity, minimum_stock, product:products(id, sku, name, category)")
      .order("updated_at", { ascending: false }) as any;
    setInventory((inv as InventoryRow[]) ?? []);

    const { count: pendingCount } = await supabase.from("demand_predictions")
      .select("*", { count: "exact", head: true }).eq("status", "pending");
    setPendingPredictions(pendingCount ?? 0);

    const in10 = new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0];
    const { count: expCount } = await supabase.from("product_batches")
      .select("*", { count: "exact", head: true }).lte("expiration_date", in10);
    setExpiring(expCount ?? 0);

    const { data: lastPred } = await supabase.from("demand_predictions")
      .select("is_safe_mode").order("created_at", { ascending: false }).limit(1).maybeSingle();
    setSafeMode(!!lastPred?.is_safe_mode);
    setLoading(false);
  };

  const ruptures = inventory.filter(i => i.current_quantity <= i.minimum_stock).length;
  const totalSkus = inventory.length;

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground font-headline">Concierge</h2>
            {safeMode && (
              <Badge variant="outline" className="border-tertiary text-tertiary">
                <Activity className="w-3 h-3 mr-1" /> Modo de Segurança
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground font-medium tracking-wide">
            Inteligência preditiva de estoque · {roles.map(r => ROLE_LABELS[r]).join(" · ") || "Sem papel atribuído"}
          </p>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Rupturas iminentes</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{ruptures}</p></CardContent>
          </Card>
          <Card className="border-l-4 border-l-tertiary">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Próximos do vencimento</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{expiring}</p></CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sugestões IA pendentes</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{pendingPredictions}</p></CardContent>
          </Card>
          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">SKUs ativos</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{totalSkus}</p></CardContent>
          </Card>
        </section>

        {/* Atalhos */}
        <section className="grid md:grid-cols-3 gap-4">
          <Link to="/inventory"><Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardHeader><Package className="w-8 h-8 text-primary mb-2" /><CardTitle>Inventário Ativo</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Lista de produtos, ajuste de estoque, registro de perdas.</CardContent>
          </Card></Link>
          <Link to="/predictions"><Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardHeader><Sparkles className="w-8 h-8 text-primary mb-2" /><CardTitle>Sugestões da IA</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Aprovar, rejeitar ou editar quantidades sugeridas com explicabilidade.</CardContent>
          </Card></Link>
          <Link to="/reports"><Card className="hover:shadow-lg transition cursor-pointer h-full">
            <CardHeader><TrendingUp className="w-8 h-8 text-primary mb-2" /><CardTitle>Relatórios &amp; BI</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Giro de estoque, GMROI, rupturas evitadas, acurácia da IA.</CardContent>
          </Card></Link>
        </section>

        {/* Lista crítica */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-2xl font-bold font-headline">Estoque crítico</h3>
            <Button variant="outline" asChild><Link to="/inventory">Ver tudo</Link></Button>
          </div>
          {loading ? <p className="text-muted-foreground">Carregando…</p> : ruptures === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma ruptura iminente. Operação saudável.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {inventory.filter(i => i.current_quantity <= i.minimum_stock).slice(0, 5).map(row => (
                <Card key={row.id}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{row.product?.name}</p>
                      <p className="text-xs text-muted-foreground">SKU {row.product?.sku} · {row.product?.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />{row.current_quantity} un.</Badge>
                      <p className="text-xs text-muted-foreground mt-1">mín. {row.minimum_stock}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
