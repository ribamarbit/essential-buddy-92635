import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ShieldAlert, TrendingDown, RefreshCw, ShoppingBag } from "lucide-react";

interface PromoSuggestion {
  item_name: string;
  category: string;
  suggested_action: string;
  estimated_discount_pct: number;
  confidence: number;
  explanation: string;
}

interface SearchedItem {
  id: string;
  name: string;
  icon?: string;
  estimatedPrice?: number;
  category?: string;
}

const Predictions = () => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<PromoSuggestion[]>([]);
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [searched, setSearched] = useState<SearchedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  // Carrega últimas pesquisas do cliente (shopping list local)
  const loadSearched = (): SearchedItem[] => {
    try {
      const stored = localStorage.getItem("shoppingList");
      const parsed = stored ? JSON.parse(stored) : [];
      const list: SearchedItem[] = Array.isArray(parsed) ? parsed : [];
      setSearched(list);
      return list;
    } catch {
      setSearched([]);
      return [];
    }
  };

  useEffect(() => {
    loadSearched();
  }, []);

  const generate = async () => {
    const list = loadSearched();
    if (list.length === 0) {
      toast({
        title: "Sem pesquisas recentes",
        description: "Adicione itens à sua lista de compras para receber recomendações.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-prediction", {
        body: {
          searched_items: list.map(i => ({
            name: i.name,
            category: i.category,
            estimated_price: i.estimatedPrice
          }))
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSuggestions(data.suggestions ?? []);
      setIsSafeMode(!!data.safe_mode);
      setGeneratedAt(new Date().toLocaleString("pt-BR"));
      toast({
        title: "Recomendações geradas ✨",
        description: `${data.suggestions?.length ?? 0} oportunidades encontradas.`
      });
    } catch (e: any) {
      toast({
        title: "Erro ao gerar recomendações",
        description: e.message ?? "Tente novamente em instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        <header>
          <h2 className="text-3xl font-extrabold font-headline flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" /> Promoções recomendadas pela IA
          </h2>
          <p className="text-muted-foreground">
            Recomendações personalizadas com base nas suas últimas pesquisas e itens da lista de compras.
          </p>
        </header>

        <Card className="bg-muted/40">
          <CardContent className="py-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{searched.length} item(ns) pesquisado(s) recentemente</p>
                {generatedAt && (
                  <p className="text-xs text-muted-foreground">Última análise: {generatedAt}</p>
                )}
              </div>
            </div>
            <Button onClick={generate} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Analisando..." : "Buscar promoções"}
            </Button>
          </CardContent>
        </Card>

        {suggestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground space-y-2">
              <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p>Nenhuma recomendação ainda.</p>
              <p className="text-sm">
                Adicione itens à sua lista de compras e clique em "Buscar promoções" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <Card key={i} className={isSafeMode ? "border-tertiary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{s.item_name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">{s.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isSafeMode && (
                        <Badge variant="outline" className="border-tertiary text-tertiary">
                          <ShieldAlert className="w-3 h-3 mr-1" />Modo Seguro
                        </Badge>
                      )}
                      <Badge variant={s.confidence >= 70 ? "default" : "secondary"}>
                        Confiança {s.confidence.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Economia estimada
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        ~{s.estimated_discount_pct.toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Ação sugerida</p>
                      <p className="text-sm font-medium">{s.suggested_action}</p>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded p-3 text-sm">
                    <p className="font-semibold mb-1">Por quê?</p>
                    <p className="text-muted-foreground">{s.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Predictions;
