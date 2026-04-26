import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Eye, Shield, ShieldOff } from "lucide-react";

const POLICY_VERSION = "2025-04-25-v1";
const CONSENT_TYPE = "operator_productivity_monitoring";

const USED = [
  "SKU e código de barras do produto",
  "Categoria do produto",
  "Quantidade vendida (agregada)",
  "Data e hora da venda",
  "Estoque atual e mínimo por SKU",
  "Lotes e datas de validade",
  "Movimentações de estoque (entrada, saída, ajuste, perda)",
  "Sazonalidade semanal e mensal",
  "Clima agregado por região",
  "Lead time do fornecedor",
  "Decisões humanas sobre sugestões da IA (aprovou/editou/rejeitou)",
  "Consentimentos do operador (versão da política e data)",
  "E-mail e nome do operador (para login e auditoria)",
  "Papéis atribuídos ao operador (RBAC)",
  "CPF do cliente para nota fiscal — criptografado AES-256, opcional, nunca retornado pela API",
  "Endereço de entrega do pedido (quando aplicável ao delivery)",
  "Logs de auditoria de ações críticas (retenção 24 meses)",
];
const NOT_USED = [
  "CPF do cliente para fins analíticos ou de IA",
  "Nome, telefone ou e-mail do consumidor final do PDV",
  "Dados de pagamento (cartão, PIX, conta bancária)",
  "Identificadores de programa de fidelidade",
  "Geolocalização contínua do operador ou do cliente",
  "Biometria (facial, digital, voz)",
  "Histórico de navegação fora do app",
  "Cookies de terceiros para rastreamento publicitário",
  "Conteúdo de mensagens privadas",
  "Dados de menores de idade",
];

const Transparency = () => {
  const { toast } = useToast();
  const [consent, setConsent] = useState<{ accepted: boolean; accepted_at?: string; revoked_at?: string } | null>(null);
  const [counts, setCounts] = useState({ products: 0, batches: 0, movements: 0 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: c } = await supabase.from("operator_consents")
      .select("*").eq("user_id", user.id).eq("consent_type", CONSENT_TYPE).order("accepted_at", { ascending: false }).limit(1).maybeSingle();
    setConsent(c as any);

    const [{ count: p }, { count: b }, { count: m }] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("product_batches").select("*", { count: "exact", head: true }),
      supabase.from("inventory_movements").select("*", { count: "exact", head: true }),
    ]);
    setCounts({ products: p ?? 0, batches: b ?? 0, movements: m ?? 0 });
  };

  const toggleConsent = async (accepted: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Atualiza o estado IMEDIATAMENTE para que o switch e o card animem
    // sem esperar o round-trip do banco.
    setConsent({
      accepted,
      accepted_at: accepted ? new Date().toISOString() : undefined,
      revoked_at: accepted ? undefined : new Date().toISOString(),
    });

    // Persistência em background — sem toast, a animação é o feedback.
    await supabase.from("operator_consents").insert({
      user_id: user.id, consent_type: CONSENT_TYPE, accepted,
      accepted_at: accepted ? new Date().toISOString() : null,
      revoked_at: accepted ? null : new Date().toISOString(),
      policy_version: POLICY_VERSION
    });
  };

  const handleHardDelete = async () => {
    if (!confirm("Hard delete LGPD: removerá sua conta e anonimizará registros históricos. Continuar?")) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.functions.invoke("hard-delete-user", { body: { target_user_id: user.id } });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Conta removida" });
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-6">
        <header>
          <h2 className="text-3xl font-extrabold font-headline flex items-center gap-2">
            <Eye className="w-7 h-7 text-primary" /> O que o Concierge sabe?
          </h2>
          <p className="text-muted-foreground">Transparência LGPD — minimização de dados é princípio do sistema.</p>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Produtos monitorados</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{counts.products}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Lotes ativos</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{counts.batches}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Movimentações registradas</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{counts.movements}</p></CardContent></Card>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Dados usados pela IA</CardTitle></CardHeader>
            <CardContent><ul className="space-y-1 text-sm">{USED.map(u => <li key={u}>✓ {u}</li>)}</ul></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldOff className="w-5 h-5 text-destructive" />Dados NÃO coletados</CardTitle></CardHeader>
            <CardContent><ul className="space-y-1 text-sm">{NOT_USED.map(u => <li key={u}>✕ {u}</li>)}</ul></CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle id="consent-title">Consentimento de monitoramento de produtividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p id="consent-desc" className="text-sm text-muted-foreground">
              Permite registrar tempo de contagem, divergências, ajustes e horários de sincronização. Não inclui geolocalização contínua, biometria ou dados pessoais.
            </p>

            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={`flex items-center justify-between gap-4 rounded-lg border-2 p-4 transition-all duration-700 ease-out ${
                consent?.accepted
                  ? "border-primary bg-primary/20 shadow-[0_0_24px_-4px_hsl(var(--primary)/0.6)] brightness-110"
                  : "border-muted-foreground/20 bg-muted/40 brightness-90"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                    consent?.accepted
                      ? "bg-primary text-primary-foreground scale-100 rotate-0"
                      : "bg-muted text-muted-foreground scale-90 -rotate-12"
                  }`}
                >
                  {consent?.accepted ? <Shield className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`inline-block h-2 w-2 rounded-full transition-all duration-500 ${
                        consent?.accepted ? "bg-primary animate-pulse" : "bg-muted-foreground/40"
                      }`}
                    />
                    {consent?.accepted ? "Monitoramento ativo" : "Monitoramento desativado"}
                  </p>
                  {consent?.accepted_at && consent?.accepted && (
                    <p className="text-xs text-muted-foreground truncate">
                      desde {new Date(consent.accepted_at).toLocaleString("pt-BR")} · política {POLICY_VERSION}
                    </p>
                  )}
                  {!consent?.accepted && (
                    <p className="text-xs text-muted-foreground">Nenhum dado de produtividade está sendo coletado.</p>
                  )}
                </div>
              </div>

              <Switch
                checked={!!consent?.accepted}
                onCheckedChange={toggleConsent}
                aria-labelledby="consent-title"
                aria-describedby="consent-desc consent-state"
                className="scale-125 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30 transition-all"
              />
            </div>
            <span id="consent-state" className="sr-only">
              {consent?.accepted
                ? "Consentimento de monitoramento de produtividade ATIVO. Acione o interruptor para revogar."
                : "Consentimento de monitoramento de produtividade INATIVO. Acione o interruptor para autorizar."}
            </span>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader><CardTitle className="text-destructive">Direito ao esquecimento</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Hard delete remove sua conta e anonimiza registros históricos mantendo apenas o necessário para auditoria operacional. Logs de auditoria são apagados automaticamente após 24 meses.</p>
            <Button variant="destructive" onClick={handleHardDelete}>Executar hard delete da minha conta</Button>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="py-4 text-xs text-muted-foreground">
            <Badge variant="outline" className="mb-2">Retenção</Badge>
            <p>Logs de auditoria: 24 meses. Após esse período, são removidos automaticamente. Vendas do PDV são sanitizadas na ingestão (CPF, nome, telefone, e-mail e dados de pagamento são descartados antes da persistência).</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Transparency;
