// Edge function: gera sugestão de compra com IA + fallback Safe Mode
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIN_CONFIDENCE = 60;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { product_id } = await req.json();
    if (!product_id) {
      return new Response(JSON.stringify({ error: "product_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Carrega produto + estoque + vendas dos últimos 28 dias
    const { data: product } = await supabase.from("products").select("*").eq("id", product_id).single();
    if (!product) throw new Error("Produto não encontrado");

    const { data: inv } = await supabase.from("inventory_balances").select("*").eq("product_id", product_id).maybeSingle();
    const currentStock = Number(inv?.current_quantity ?? 0);
    const minimumStock = Number(inv?.minimum_stock ?? 0);

    const since = new Date(Date.now() - 28 * 86400000).toISOString();
    const { data: sales } = await supabase.from("pos_sales_clean")
      .select("quantity, sold_at").eq("product_id", product_id).gte("sold_at", since);

    const totalSold = (sales ?? []).reduce((s, r) => s + Number(r.quantity), 0);
    const avgDaily = totalSold / 28;
    const leadTimeDays = 5;
    const safetyFactor = 0.2;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let suggested = 0, confidence = 0, explanation = "", isSafeMode = false, modelVersion = "safe-mode-v1";

    // Tenta IA primeiro
    if (LOVABLE_API_KEY && (sales?.length ?? 0) > 0) {
      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "Você é um analista de estoque. Use APENAS dados agregados (SKU, vendas, estoque). NUNCA use dados pessoais. Responda em JSON." },
              { role: "user", content: `Produto: ${product.name} (SKU ${product.sku}, categoria ${product.category}). Estoque atual: ${currentStock}. Vendas últimos 28 dias: ${totalSold} (média diária ${avgDaily.toFixed(2)}). Lead time: ${leadTimeDays} dias. Retorne JSON {suggested_quantity, confidence (0-100), explanation (português, máx 3 frases citando demanda, cobertura e sazonalidade)}.` }
            ],
            tools: [{
              type: "function",
              function: {
                name: "predict",
                parameters: {
                  type: "object",
                  properties: {
                    suggested_quantity: { type: "number" },
                    confidence: { type: "number" },
                    explanation: { type: "string" }
                  },
                  required: ["suggested_quantity", "confidence", "explanation"]
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "predict" } }
          })
        });

        if (aiResp.status === 429 || aiResp.status === 402) {
          throw new Error(`AI gateway ${aiResp.status}`);
        }
        if (!aiResp.ok) throw new Error("AI failed");

        const aiData = await aiResp.json();
        const args = JSON.parse(aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}");
        suggested = Number(args.suggested_quantity);
        confidence = Number(args.confidence);
        explanation = String(args.explanation);
        modelVersion = "lovable-ai-gemini-3-flash";

        if (confidence < MIN_CONFIDENCE) throw new Error("Low confidence");
      } catch (e) {
        console.log("Falling back to safe mode:", e);
        isSafeMode = true;
      }
    } else {
      isSafeMode = true;
    }

    // Safe mode: regras estáticas
    if (isSafeMode) {
      const required = avgDaily * leadTimeDays;
      const safety = required * safetyFactor;
      const target = Math.max(required + safety, minimumStock);
      suggested = Math.max(target - currentStock, 0);
      confidence = avgDaily > 0 ? 70 : 40;
      explanation = `Modo de Segurança ativo. Cálculo baseado em média móvel (${avgDaily.toFixed(2)}/dia × ${leadTimeDays} dias de lead time + ${(safetyFactor * 100)}% de margem). Estoque atual: ${currentStock}. Aprovação humana obrigatória.`;
      modelVersion = "safe-mode-v1";
    }

    // Salva predição
    const { data: pred, error } = await supabase.from("demand_predictions").insert({
      store_id: inv?.store_id ?? crypto.randomUUID(),
      product_id,
      suggested_quantity: Math.round(suggested),
      confidence_score: Math.min(100, Math.max(0, confidence)),
      model_version: modelVersion,
      explanation,
      is_safe_mode: isSafeMode
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ prediction: pred, safe_mode: isSafeMode }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("generate-prediction error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
