/**
 * =============================================================================
 * SUPPORT.TSX - Central de Suporte
 * =============================================================================
 * 
 * Esta página fornece informações de contato e um formulário para
 * que o usuário entre em contato com o suporte.
 * 
 * Funcionalidades:
 * - Cards de canais de contato (email, telefone, chat)
 * - Formulário de contato com validação
 * - Seção de Perguntas Frequentes (FAQ)
 * 
 * =============================================================================
 */

// Importações do React
import { useState } from "react";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Hooks
import { useToast } from "@/hooks/use-toast";

// Ícones
import { Mail, MessageSquare, Phone, Send } from "lucide-react";

/**
 * Componente principal da Central de Suporte
 */
const Support = () => {
  // Hook para notificações toast
  const { toast } = useToast();
  
  // Estado do formulário de contato
  const [formData, setFormData] = useState({
    name: "",      // Nome do usuário
    email: "",     // Email para contato
    subject: "",   // Assunto da mensagem
    message: ""    // Conteúdo da mensagem
  });

  /**
   * Processa o envio do formulário de contato
   * Valida campos obrigatórios e simula envio
   * 
   * @param e - Evento de submit do formulário
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos obrigatórios
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Simula envio (em produção, enviaria para um backend)
    toast({
      title: "Mensagem enviada! ✅",
      description: "Entraremos em contato em breve."
    });

    // Limpa o formulário
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  // ==========================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ==========================================================================
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ================================================================
            CABEÇALHO DA PÁGINA
            ================================================================ */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Central de Suporte</h1>
          <p className="text-muted-foreground">
            Estamos aqui para ajudar! Entre em contato conosco através do formulário abaixo ou pelos nossos canais de atendimento.
          </p>
        </div>

        {/* ================================================================
            CARDS DE CANAIS DE CONTATO
            Exibe email, telefone e horário de chat
            ================================================================ */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Card: Email */}
          <Card>
            <CardHeader>
              <Mail className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">E-mail</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">suporte@concierge.com</p>
            </CardContent>
          </Card>

          {/* Card: Telefone */}
          <Card>
            <CardHeader>
              <Phone className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Telefone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">(11) 1234-5678</p>
            </CardContent>
          </Card>

          {/* Card: Chat */}
          <Card>
            <CardHeader>
              <MessageSquare className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Seg-Sex: 9h às 18h</p>
            </CardContent>
          </Card>
        </div>

        {/* ================================================================
            FORMULÁRIO DE CONTATO
            Permite enviar mensagem para o suporte
            ================================================================ */}
        <Card>
          <CardHeader>
            <CardTitle>Envie sua mensagem</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo e retornaremos o mais breve possível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campos: Nome e Email (lado a lado em desktop) */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Campo: Nome completo */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                {/* Campo: Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Campo: Assunto */}
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  placeholder="Como podemos ajudar?"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              {/* Campo: Mensagem */}
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Descreva sua dúvida ou problema..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              {/* Botão de envio */}
              <Button type="submit" className="w-full bg-gradient-primary">
                <Send className="w-4 h-4 mr-2" />
                Enviar mensagem
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ================================================================
            SEÇÃO DE PERGUNTAS FREQUENTES (FAQ)
            Respostas para dúvidas comuns
            ================================================================ */}
        <Card className="mt-6 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* FAQ: Como adicionar produtos */}
            <div>
              <h4 className="font-semibold text-sm mb-1">Como faço para adicionar produtos?</h4>
              <p className="text-sm text-muted-foreground">Acesse a aba "Adicionar Itens" no menu principal e preencha as informações do produto.</p>
            </div>
            
            {/* FAQ: Compartilhar lista */}
            <div>
              <h4 className="font-semibold text-sm mb-1">Posso compartilhar minha lista de compras?</h4>
              <p className="text-sm text-muted-foreground">Sim! Na página de Lista de Compras, clique no botão de compartilhar.</p>
            </div>
            
            {/* FAQ: Acessibilidade */}
            <div>
              <h4 className="font-semibold text-sm mb-1">Como ativo a acessibilidade?</h4>
              <p className="text-sm text-muted-foreground">Clique no botão flutuante de acessibilidade no canto inferior direito da tela.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;
