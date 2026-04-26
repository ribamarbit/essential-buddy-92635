import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Sparkles, TrendingDown, Repeat } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";

interface ShoppingItem {
  id: string;
  name: string;
  estimatedPrice?: number;
  category?: string;
}

const Reports = () => {
  const { canViewAuditLogs } = useUserRoles();
  const [stats, setStats] = useState({
    itemsSearched: 0,
    estimatedTotal: 0,
    promoSuggestions: 0,
    estimatedSavings: 0,
    recurringItems: 0,
  });
  const [topCategories, setTopCategories] = useState<{ name: string; count: number }[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      // Pesquisas / lista do cliente (localStorage)
      let list: ShoppingItem[] = [];
      try {
        const stored = localStorage.getItem("shoppingList");
        const parsed = stored ? JSON.parse(stored) : [];
        list = Array.isArray(parsed) ? parsed : [];
      } catch { list = []; }

      const estimatedTotal = list.reduce((s, i) => s + Number(i.estimatedPrice ?? 0), 0);

      // Categorias mais pesquisadas
      const catMap = new Map<string, number>();
      list.forEach(i => {
        const c = (i.category ?? "geral").toLowerCase();
        catMap.set(c, (catMap.get(c) ?? 0) + 1);
      });
      const cats = Array.from(catMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopCategories(cats);

      // Itens recorrentes (aparecem em pesquisas frequentes — proxy: nome repetido)
      const nameCount = new Map<string, number>();
      list.forEach(i => {
        const k = i.name.toLowerCase().trim();
        nameCount.set(k, (nameCount.get(k) ?? 0) + 1);
      });
      const recurring = Array.from(nameCount.values()).filter(v => v > 1).length;

      // Recomendações de IA (promoções) geradas para este usuário
      const { data: { user } } = await supabase.auth.getUser();
      let promoCount = 0;
      let savings = 0;
      if (user) {
        const { data: preds } = await supabase
          .from("demand_predictions")
          .select("explanation, confidence_score")
          .eq("store_id", user.id)
          .ilike("explanation", "[Promoção]%");
        promoCount = preds?.length ?? 0;
        // Extrai % de desconto do texto "[Promoção] ... (~XX% off)"
        savings = (preds ?? []).reduce((sum, p: any) => {
          const m = /~(\d+(?:\.\d+)?)%/.exec(p.explanation ?? "");
          const pct = m ? Number(m[1]) : 0;
          return sum + pct;
        }, 0);
      }

      setStats({
        itemsSearched: list.length,
        estimatedTotal,
        promoSuggestions: promoCount,
        estimatedSavings: savings,
        recurringItems: recurring,
      });

      if (canViewAuditLogs) {
        const { data: l } = await supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);
        setLogs(l ?? []);
      }
    })();
  }, [canViewAuditLogs]);

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        <header>
          <h2 className="text-3xl font-extrabold font-headline">Meu painel de compras</h2>
          <p className="text-muted-foreground">
            Resumo das suas pesquisas, recomendações da IA e oportunidades de economia.
          </p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Itens pesquisados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.itemsSearched}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total estimado da lista</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">R$ {stats.estimatedTotal.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Recomendações da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.promoSuggestions}</p>
            </CardContent>
          </Card>

          <Card className="bg-primary/10">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4" /> Economia potencial acumulada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">~{stats.estimatedSavings.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Soma dos descontos sugeridos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Repeat className="w-4 h-4" /> Itens recorrentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.recurringItems}</p>
              <p className="text-xs text-muted-foreground mt-1">Pesquisados mais de uma vez</p>
            </CardContent>
          </Card>
        </section>

        {topCategories.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold font-headline mb-3">Categorias que você mais pesquisa</h3>
            <div className="flex flex-wrap gap-2">
              {topCategories.map(c => (
                <Badge key={c.name} variant="secondary" className="text-sm py-1.5 px-3 capitalize">
                  {c.name} · {c.count}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {canViewAuditLogs && (
          <section>
            <h3 className="text-2xl font-bold font-headline mb-3">
              Logs de auditoria
              <Badge variant="outline" className="ml-2 text-xs">Retenção 24 meses</Badge>
            </h3>
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">Sem registros recentes.</p>
              ) : logs.map(l => (
                <Card key={l.id}>
                  <CardContent className="py-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <p>
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded mr-2">{l.action}</span>
                        {l.readable_description}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(l.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Reports;
