// Edge function: recebe venda do PDV e remove dados pessoais antes de persistir (LGPD)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sanitiza payload do PDV: descarta CPF, nome, telefone, e-mail, fidelidade
function cleanPosPayload(raw: Record<string, unknown>) {
  return {
    external_transaction_id: String(raw.transaction_id ?? raw.external_transaction_id ?? crypto.randomUUID()),
    store_id: String(raw.store_id),
    product_id: String(raw.product_id),
    quantity: Number(raw.quantity),
    total_value: Number(raw.total_value),
    sold_at: raw.sold_at ? new Date(String(raw.sold_at)).toISOString() : new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const raw = await req.json();
    const clean = cleanPosPayload(raw);

    if (!clean.product_id || !clean.store_id || isNaN(clean.quantity)) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("pos_sales_clean").insert(clean);
    if (error) throw error;

    // Atualiza estoque (saída)
    const { data: inv } = await supabase.from("inventory_balances")
      .select("id, current_quantity").eq("product_id", clean.product_id).maybeSingle();
    if (inv) {
      await supabase.from("inventory_balances")
        .update({ current_quantity: Math.max(0, Number(inv.current_quantity) - clean.quantity), updated_at: new Date().toISOString() })
        .eq("id", inv.id);
    }

    return new Response(JSON.stringify({ ok: true, sanitized_fields_removed: ["cpf", "name", "phone", "email", "loyalty_id", "payment_data"] }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("ingest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
