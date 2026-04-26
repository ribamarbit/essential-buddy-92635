// Edge function: gera recomendações de PROMOÇÕES baseadas nas pesquisas/lista do cliente.
// Usa Lovable AI Gateway. Fallback Safe Mode com regras simples se a IA falhar.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchedItem {
  name: string;
  category?: string;
  estimated_price?: number;
}

interface PromoSuggestion {
  item_name: string;
  category: string;
  suggested_action: string;       // ex: "Comprar em promoção", "Aguardar baixa", "Substituir por marca X"
  estimated_discount_pct: number; // 0-100
  confidence: number;             // 0-100
  explanation: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const searchedItems: SearchedItem[] = Array.isArray(body.searched_items) ? body.searched_items : [];

    if (searchedItems.length === 0) {
      return new Response(JSON.stringify({
        error: "Envie 'searched_items' (lista das últimas pesquisas/itens do cliente)."
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Identifica usuário (opcional — apenas para logs e store_id)
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    let userId: string | null = null;
    if (jwt) {
      const { data: { user } } = await supabase.auth.getUser(jwt);
      userId = user?.id ?? null;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let suggestions: PromoSuggestion[] = [];
    let isSafeMode = false;
    let modelVersion = "safe-mode-promo-v1";

    // Tenta IA primeiro
    if (LOVABLE_API_KEY) {
      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "Você é o Concierge.AI, um assistente de compras pessoal brasileiro. " +
                  "Recebe a LISTA DE PESQUISAS RECENTES do cliente (itens que ele pesquisou ou adicionou à lista) " +
                  "e recomenda PROMOÇÕES inteligentes: melhor momento de comprar, marcas alternativas mais baratas, " +
                  "produtos sazonais em queda de preço, combos com economia. " +
                  "NUNCA use dados pessoais sensíveis. Responda em português, objetivo e amigável."
              },
              {
                role: "user",
                content:
                  "Pesquisas recentes do cliente:\n" +
                  searchedItems.map((i, idx) =>
                    `${idx + 1}. ${i.name}${i.category ? ` (${i.category})` : ""}` +
                    `${i.estimated_price ? ` — preço estimado R$ ${i.estimated_price.toFixed(2)}` : ""}`
                  ).join("\n") +
                  "\n\nRetorne 3 a 5 recomendações de promoções/oportunidades de economia."
              }
            ],
            tools: [{
              type: "function",
              function: {
                name: "recommend_promotions",
                description: "Recomenda promoções e oportunidades de economia",
                parameters: {
                  type: "object",
                  properties: {
                    suggestions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          item_name: { type: "string", description: "Item alvo da recomendação" },
                          category: { type: "string", description: "Categoria (ex: hortifruti, limpeza)" },
                          suggested_action: {
                            type: "string",
                            description: "Ação recomendada (ex: 'Comprar agora em promoção', 'Aguardar baixa', 'Substituir por marca X')"
                          },
                          estimated_discount_pct: {
                            type: "number",
                            description: "Desconto estimado em % (0 a 60)"
                          },
                          confidence: { type: "number", description: "Confiança 0-100" },
                          explanation: {
                            type: "string",
                            description: "Justificativa em 1-2 frases (sazonalidade, alternativa, combo)"
                          }
                        },
                        required: ["item_name", "category", "suggested_action", "estimated_discount_pct", "confidence", "explanation"]
                      }
                    }
                  },
                  required: ["suggestions"]
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "recommend_promotions" } }
          })
        });

        if (aiResp.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requisições da IA atingido. Tente em alguns instantes." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if (aiResp.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos da IA esgotados. Adicione créditos no workspace." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if (!aiResp.ok) throw new Error(`AI status ${aiResp.status}`);

        const aiData = await aiResp.json();
        const args = JSON.parse(aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}");
        suggestions = Array.isArray(args.suggestions) ? args.suggestions : [];
        modelVersion = "lovable-ai-gemini-2.5-flash";
        if (suggestions.length === 0) throw new Error("IA retornou vazio");
      } catch (e) {
        console.log("Fallback safe mode:", e);
        isSafeMode = true;
      }
    } else {
      isSafeMode = true;
    }

    // Safe mode: regra estática (sazonalidade básica + alerta de marca)
    if (isSafeMode) {
      suggestions = searchedItems.slice(0, 5).map((i) => ({
        item_name: i.name,
        category: i.category ?? "geral",
        suggested_action: "Comparar marcas alternativas e mercados próximos",
        estimated_discount_pct: 10,
        confidence: 50,
        explanation:
          "Modo de Segurança ativo. Recomendação genérica: pesquise pelo menos 2 marcas e 2 mercados antes de comprar. " +
          "Promoções específicas indisponíveis no momento."
      }));
      modelVersion = "safe-mode-promo-v1";
    }

    // Salva uma "predição agregada" por item recomendado, só para histórico/auditoria
    // (mantém compatibilidade com tabela demand_predictions usando store_id sintético do usuário)
    const storeId = userId ?? crypto.randomUUID();
    const inserted: any[] = [];
    for (const s of suggestions) {
      // Tenta achar produto por nome (best-effort, não bloqueia)
      const { data: product } = await supabase.from("products")
        .select("id").ilike("name", `%${s.item_name}%`).limit(1).maybeSingle();

      const productId = product?.id ?? null;
      if (!productId) continue; // se não houver produto cadastrado, só retorna no payload

      const { data: pred } = await supabase.from("demand_predictions").insert({
        store_id: storeId,
        product_id: productId,
        suggested_quantity: 1,
        confidence_score: Math.min(100, Math.max(0, s.confidence)),
        model_version: modelVersion,
        explanation: `[Promoção] ${s.suggested_action} (~${s.estimated_discount_pct}% off). ${s.explanation}`,
        is_safe_mode: isSafeMode
      }).select().maybeSingle();
      if (pred) inserted.push(pred);
    }

    if (userId) {
      await supabase.from("audit_logs").insert({
        actor_user_id: userId,
        action: "promo_suggestions_generated",
        entity_type: "demand_predictions",
        entity_id: null,
        readable_description: `IA gerou ${suggestions.length} recomendações de promoções a partir de ${searchedItems.length} pesquisas.`
      });
    }

    return new Response(JSON.stringify({
      suggestions,
      safe_mode: isSafeMode,
      model_version: modelVersion,
      persisted: inserted.length
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-prediction error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
