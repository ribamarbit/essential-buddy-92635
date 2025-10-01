import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Phone, Send } from "lucide-react";

const Support = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Mensagem enviada! ✅",
      description: "Entraremos em contato em breve."
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Central de Suporte</h1>
          <p className="text-muted-foreground">
            Estamos aqui para ajudar! Entre em contato conosco através do formulário abaixo ou pelos nossos canais de atendimento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Mail className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">E-mail</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">suporte@concierge.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Telefone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">(11) 1234-5678</p>
            </CardContent>
          </Card>

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

        <Card>
          <CardHeader>
            <CardTitle>Envie sua mensagem</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo e retornaremos o mais breve possível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
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

              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  placeholder="Como podemos ajudar?"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

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

              <Button type="submit" className="w-full bg-gradient-primary">
                <Send className="w-4 h-4 mr-2" />
                Enviar mensagem
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">Como faço para adicionar produtos?</h4>
              <p className="text-sm text-muted-foreground">Acesse a aba "Adicionar Itens" no menu principal e preencha as informações do produto.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Posso compartilhar minha lista de compras?</h4>
              <p className="text-sm text-muted-foreground">Sim! Na página de Lista de Compras, clique no botão de compartilhar.</p>
            </div>
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
