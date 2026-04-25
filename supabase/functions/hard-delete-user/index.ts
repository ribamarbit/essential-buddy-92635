// Edge function: hard delete LGPD-compliant (apenas admin)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } }
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Sessão inválida" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Apenas admin pode executar hard delete" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { target_user_id } = await req.json();
    if (!target_user_id) return new Response(JSON.stringify({ error: "target_user_id obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Anonimiza referências históricas (mantém rastreabilidade operacional)
    await admin.from("inventory_movements").update({ performed_by: null }).eq("performed_by", target_user_id);
    await admin.from("ai_suggestion_decisions").update({ human_reason: "[ANONIMIZADO POR HARD DELETE LGPD]" }).eq("decided_by", target_user_id);
    await admin.from("audit_logs").update({ readable_description: "[ANONIMIZADO]", actor_user_id: null }).eq("actor_user_id", target_user_id);

    // Revoga consentimentos e papéis
    await admin.from("operator_consents").delete().eq("user_id", target_user_id);
    await admin.from("user_roles").delete().eq("user_id", target_user_id);

    // Remove de auth.users (cascade remove app_users)
    await admin.auth.admin.deleteUser(target_user_id);

    // Registra evidência
    await admin.from("audit_logs").insert({
      actor_user_id: user.id,
      action: "hard_delete_user",
      entity_type: "app_users",
      entity_id: target_user_id,
      readable_description: `Hard delete LGPD executado para usuário ${target_user_id}`
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("hard-delete error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
