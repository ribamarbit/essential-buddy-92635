import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  name: string;
  confirmationUrl: string;
}

const createEmailHtml = (name: string, confirmationUrl: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu cadastro</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; max-width: 600px;">
          <tr>
            <td style="padding: 40px 40px 0;">
              <h1 style="color: #333; font-size: 28px; font-weight: bold; text-align: center; margin: 0;">
                Bem-vindo ao Concierge de Compras! 🛒
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333; font-size: 16px; line-height: 26px; margin: 0 0 16px;">
                Olá ${name},
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; margin: 0 0 16px;">
                Obrigado por se cadastrar no Concierge de Compras! Estamos muito felizes em tê-lo(a) conosco.
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; margin: 0 0 16px;">
                Para começar a usar nossa plataforma, precisamos que você confirme seu endereço de email. 
                Clique no botão abaixo para ativar sua conta:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="padding: 27px 0;">
                <tr>
                  <td align="center">
                    <a href="${confirmationUrl}" 
                       style="background-color: #3b82f6; 
                              border-radius: 8px; 
                              color: #ffffff; 
                              font-size: 16px; 
                              font-weight: bold; 
                              text-decoration: none; 
                              padding: 14px 40px; 
                              display: inline-block;">
                      Confirmar meu cadastro
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Ou copie e cole este link no seu navegador:
              </p>
              
              <p style="color: #666; font-size: 14px; line-height: 24px; word-break: break-all; margin: 16px 0;">
                ${confirmationUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 20px 0;">
              
              <p style="color: #8898aa; font-size: 14px; line-height: 24px; margin: 16px 0;">
                Se você não criou uma conta no Concierge de Compras, pode ignorar este email com segurança.
              </p>
              
              <p style="color: #8898aa; font-size: 14px; line-height: 24px; margin: 16px 0;">
                Atenciosamente,<br>
                Equipe Concierge de Compras
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, confirmationUrl }: ConfirmationEmailRequest = await req.json();

    console.log("Sending confirmation email to:", email);

    const html = createEmailHtml(name, confirmationUrl);

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Concierge de Compras <suporte@concierge.com>",
        to: [email],
        subject: "Confirme seu cadastro no Concierge de Compras",
        html,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend API error:", error);
      throw new Error(`Resend API error: ${error}`);
    }

    const emailResponse = await resendResponse.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
