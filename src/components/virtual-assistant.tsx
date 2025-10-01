import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const VirtualAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Olá! Sou seu assistente virtual. Como posso ajudá-lo hoje?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const { toast } = useToast();

  const quickResponses: { [key: string]: string } = {
    "como adicionar produto": "Para adicionar um produto, clique em 'Adicionar Itens' no menu e preencha as informações necessárias como nome, categoria e preço.",
    "como ver produtos": "Acesse a aba 'Catálogo de Produtos' no menu para visualizar todos os seus produtos cadastrados.",
    "como criar lista": "Na página 'Lista de Compras', você pode adicionar produtos à sua lista e gerenciá-los facilmente.",
    "ajuda": "Posso ajudá-lo com:\n- Adicionar produtos\n- Ver catálogo\n- Criar listas de compras\n- Configurar acessibilidade\n- Dúvidas sobre o app",
    "acessibilidade": "O aplicativo possui recursos de acessibilidade como: leitor de tela, alto contraste, redução de animações e ajuste de tamanho da fonte. Acesse o botão de acessibilidade no canto inferior direito.",
    "suporte": "Para entrar em contato com o suporte, acesse a aba 'Suporte' no menu ou envie um e-mail para suporte@concierge.com"
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for exact or partial matches
    for (const [key, response] of Object.entries(quickResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Default response
    return "Desculpe, não entendi sua pergunta. Você pode perguntar sobre:\n- Como adicionar produtos\n- Como ver produtos\n- Como criar lista\n- Acessibilidade\n- Suporte\n\nOu digite 'ajuda' para ver todas as opções.";
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem.",
        variant: "destructive"
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="w-14 h-14 rounded-full bg-success hover:bg-success/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            aria-label="Abrir assistente virtual"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-96 p-0 flex flex-col">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-success" />
              Assistente Virtual
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              Tire suas dúvidas sobre o aplicativo
            </p>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isBot
                        ? "bg-muted text-foreground"
                        : "bg-success text-success-foreground"
                    }`}
                  >
                    {message.isBot && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs font-semibold">Assistente</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua pergunta..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                className="bg-success hover:bg-success/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Dica: Pergunte sobre funcionalidades, produtos ou suporte
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default VirtualAssistant;
