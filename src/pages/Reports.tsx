import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserRoles } from "@/hooks/useUserRoles";

const Reports = () => {
  const { canViewAuditLogs } = useUserRoles();
  const [stats, setStats] = useState({ totalSkus: 0, totalSales28d: 0, predictions: 0, approvedRate: 0, losses: 0, gmroi: 0 });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { count: skus } = await supabase.from("products").select("*", { count: "exact", head: true });
      const since = new Date(Date.now() - 28 * 86400000).toISOString();
      const { data: sales } = await supabase.from("pos_sales_clean").select("total_value, quantity").gte("sold_at", since);
      const totalSales = (sales ?? []).reduce((s, r) => s + Number(r.total_value), 0);

      const { data: preds } = await supabase.from("demand_predictions").select("status");
      const approved = (preds ?? []).filter(p => p.status === "approved").length;
      const total = preds?.length ?? 0;

      const { data: lossMov } = await supabase.from("inventory_movements").select("quantity").eq("movement_type", "loss");
      const losses = (lossMov ?? []).reduce((s, r) => s + Math.abs(Number(r.quantity)), 0);

      // GMROI simplificado: vendas / custo médio do estoque (proxy: total de unidades em estoque)
      const { data: inv } = await supabase.from("inventory_balances").select("current_quantity");
      const stockUnits = (inv ?? []).reduce((s, r) => s + Number(r.current_quantity), 0);
      const gmroi = stockUnits > 0 ? totalSales / stockUnits : 0;

      setStats({
        totalSkus: skus ?? 0,
        totalSales28d: totalSales,
        predictions: total,
        approvedRate: total > 0 ? (approved / total) * 100 : 0,
        losses,
        gmroi
      });

      if (canViewAuditLogs) {
        const { data: l } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(20);
        setLogs(l ?? []);
      }
    })();
  }, [canViewAuditLogs]);

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        <header>
          <h2 className="text-3xl font-extrabold font-headline">Relatórios &amp; BI</h2>
          <p className="text-muted-foreground">Indicadores agregados — sem dados pessoais de consumidores.</p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">SKUs cadastrados</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.totalSkus}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Vendas 28d (R$)</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.totalSales28d.toFixed(2)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Sugestões IA</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.predictions}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Taxa de aprovação</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.approvedRate.toFixed(0)}%</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Perdas (un.)</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.losses.toFixed(0)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">GMROI proxy</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.gmroi.toFixed(2)}</p></CardContent></Card>
        </section>

        {canViewAuditLogs && (
          <section>
            <h3 className="text-2xl font-bold font-headline mb-3">Logs de auditoria <Badge variant="outline" className="ml-2 text-xs">Retenção 24 meses</Badge></h3>
            <div className="space-y-2">
              {logs.length === 0 ? <p className="text-muted-foreground">Sem registros recentes.</p> : logs.map(l => (
                <Card key={l.id}><CardContent className="py-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <p><span className="font-mono text-xs bg-muted px-2 py-0.5 rounded mr-2">{l.action}</span>{l.readable_description}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                </CardContent></Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Reports;
