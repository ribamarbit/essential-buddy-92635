/**
 * =============================================================================
 * GET-DEMO-CREDENTIALS - Fornece credenciais demo de forma segura
 * =============================================================================
 * 
 * Esta função permite obter as credenciais do usuário demo sem expô-las
 * no código do frontend. Inclui rate limiting para prevenir abuso.
 * 
 * =============================================================================
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting em memória
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 5; // máximo 5 tentativas por minuto

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

  // Apenas POST permitido
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Obtém IP do cliente para rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Verifica rate limit
    if (!checkRateLimit(clientIP)) {
      console.log("[SECURITY] Rate limit exceeded for demo credentials");
      return new Response(
        JSON.stringify({ error: "Muitas tentativas. Aguarde um momento." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credenciais do usuário demo (do ambiente ou padrão)
    const email = Deno.env.get("DEMO_USER_EMAIL") || "demo@concierge.com";
    const password = Deno.env.get("DEMO_USER_PASSWORD") || "Demo@123456";

    console.log("[INFO] Demo credentials requested");
    
    return new Response(
      JSON.stringify({ email, password }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          // Cache curto para evitar requisições excessivas
          "Cache-Control": "private, max-age=60"
        } 
      }
    );
  } catch {
    console.log("[ERROR] Error providing demo credentials");
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
