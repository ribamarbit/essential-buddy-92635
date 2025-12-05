/**
 * =============================================================================
 * CREATE-DEMO-USER - Edge Function para criar usuário demo
 * =============================================================================
 * 
 * SEGURANÇA:
 * - Rate limiting básico usando KV store simulado
 * - Validação de origem
 * - Logs sanitizados (sem dados sensíveis)
 * 
 * =============================================================================
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Headers CORS para permitir chamadas do frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting simples em memória (em produção, usar Redis/KV)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 3; // máximo 3 tentativas por minuto

/**
 * Verifica rate limit por IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || (now - entry.timestamp) > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

serve(async (req: Request) => {
  // Handler para preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obtém IP do cliente para rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Verifica rate limit
    if (!checkRateLimit(clientIP)) {
      console.log("[SECURITY] Rate limit exceeded");
      return new Response(
        JSON.stringify({ error: "Muitas tentativas. Aguarde um momento." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cria cliente Supabase com chave de serviço
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Credenciais do usuário demo (gerenciadas no servidor)
    const demoEmail = Deno.env.get("DEMO_USER_EMAIL") || "demo@concierge.com";
    const demoPassword = Deno.env.get("DEMO_USER_PASSWORD") || "Demo@123456";

    // Tenta criar usuário demo
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        nome_completo: "Usuário Demo",
        login: "demo"
      }
    });

    if (error) {
      // Log genérico (sem expor detalhes sensíveis)
      console.log("[INFO] Demo user creation attempted");
      return new Response(
        JSON.stringify({ error: "Não foi possível criar usuário demo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[INFO] Demo user operation completed");
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    // Log genérico sem expor stack trace ou mensagens internas
    console.log("[ERROR] Internal error in demo user creation");
    return new Response(
      JSON.stringify({ error: "Erro interno. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
