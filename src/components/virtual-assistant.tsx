import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from "@/hooks/use-toast";

// Som de notificação (beep curto)
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (error) {
    console.log('Audio not supported');
  }
};

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
      text: "Olá! Sou a Concierge.AI, sua assistente virtual de compras inteligentes! 👋\n\nComo posso ajudar você hoje? Escolha uma das opções:\n\n1️⃣ Como funciona o aplicativo?\n2️⃣ Como adicionar itens?\n3️⃣ Como gerenciar produtos?\n4️⃣ Como usar a lista de compras?\n5️⃣ Preciso de suporte técnico\n6️⃣ Outras dúvidas\n\nDigite o número da opção ou escreva sua pergunta!",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickResponses: { [key: string]: string } = {
    "1": "📦 **Como o app funciona?**\n\nO Concierge de Compras tem 2 áreas principais:\n\n**CADASTRAR ITENS** → Dashboard\n• Adicione seus itens essenciais (café, leite, etc)\n• Eles aparecem no Dashboard com contagem de dias\n• Receba alertas quando estiverem acabando\n\n**PRODUTOS** → Lista de Compras\n• Cadastre produtos no catálogo\n• Clique em 'Adicionar à Lista'\n• Gerencie sua lista de compras\n\nO **Scanner** importa itens de notas fiscais direto pro Dashboard!\n\nPrecisa de mais detalhes?",
    "2": "📦 **Como adicionar itens?**\n\nExistem 3 formas:\n\n**1. CADASTRAR ITENS (vai pro Dashboard)**\n• Escolha itens essenciais da lista\n• Ou crie itens personalizados\n• Clique em 'Salvar Itens'\n• ✅ Aparecem no Dashboard\n\n**2. PRODUTOS (vai pra Lista de Compras)**\n• Acesse 'Produtos'\n• Cadastre produtos\n• Clique 'Adicionar à Lista'\n• ✅ Vão pra Lista de Compras\n\n**3. SCANNER (vai pro Dashboard)**\n• Fotografe ou cole texto de nota fiscal\n• Sistema detecta produtos automaticamente\n• ✅ Salva no Dashboard\n\nQual forma você prefere usar?",
    "3": "🛒 **Criar Lista de Compras**\n\nVou te explicar como funciona:\n\n1. Acesse 'Lista de Compras' no menu\n2. Selecione os produtos do catálogo que deseja adicionar\n3. Ajuste as quantidades conforme necessário\n4. Marque os itens como comprados ao pegá-los\n5. Você pode salvar a lista para usar depois!\n\nMuito prático para não esquecer nada nas compras! 📝\n\nPosso ajudar com mais alguma coisa?",
    "4": "♿ **Configurar Acessibilidade**\n\nNosso app é inclusivo! Temos várias opções:\n\n🔊 **Leitor de Tela** - Lê todos os textos em voz alta\n🎨 **Alto Contraste** - Melhora a visualização\n⏸️ **Reduzir Animações** - Para quem prefere menos movimento\n🔤 **Ajustar Tamanho da Fonte** - Deixe do tamanho ideal para você\n\nPara ativar:\n1. Clique no ícone de acessibilidade no canto inferior direito\n2. Escolha as opções que precisa\n\nTodos podem usar nosso app confortavelmente! 💙\n\nQuer saber mais?",
    "5": "📞 **Falar com o Suporte**\n\nEstamos aqui para ajudar!\n\n**Opções de contato:**\n• Acesse a aba 'Suporte' no menu superior\n• Envie um e-mail: suporte@concierge.com\n• Nossa equipe responde em até 24 horas\n\nPara um atendimento mais rápido, descreva detalhadamente sua dúvida ou problema.\n\nPosso ajudar com algo mais?",
    "6": "✨ **Todas as Funcionalidades**\n\nVeja tudo que nosso app oferece:\n\n1️⃣ **Adicionar Produtos** - Cadastre itens com nome, preço e categoria\n2️⃣ **Catálogo de Produtos** - Visualize e gerencie seus produtos\n3️⃣ **Lista de Compras** - Crie e organize suas compras\n4️⃣ **Dashboard** - Veja estatísticas e resumos\n5️⃣ **Acessibilidade** - Recursos para todos os usuários\n6️⃣ **Suporte** - Tire suas dúvidas com nossa equipe\n7️⃣ **Guia do Usuário** - Tutorial completo do app\n\nDigite o número da funcionalidade para saber mais detalhes! 😊",
    "adicionar": "📦 **Adicionar Produtos**\n\nÉ muito fácil! Siga estes passos:\n\n1. Clique no menu 'Adicionar Itens' no topo da página\n2. Preencha as informações do produto:\n   • Nome do produto\n   • Categoria (ex: alimentos, bebidas, limpeza)\n   • Preço\n   • Quantidade (opcional)\n3. Clique em 'Salvar'\n\nPronto! Seu produto será adicionado ao catálogo. 🎉",
    "produto": "📦 **Adicionar Produtos**\n\nÉ muito fácil! Siga estes passos:\n\n1. Clique no menu 'Adicionar Itens' no topo da página\n2. Preencha as informações do produto:\n   • Nome do produto\n   • Categoria (ex: alimentos, bebidas, limpeza)\n   • Preço\n   • Quantidade (opcional)\n3. Clique em 'Salvar'\n\nPronto! Seu produto será adicionado ao catálogo. 🎉",
    "ver": "📋 **Visualizar Produtos**\n\nPara ver todos os seus produtos cadastrados:\n\n1. Clique em 'Catálogo de Produtos' no menu superior\n2. Lá você verá todos os produtos com:\n   • Nome e descrição\n   • Preço\n   • Categoria\n   • Opções para editar ou remover\n\nVocê também pode filtrar por categoria!",
    "catalogo": "📋 **Visualizar Produtos**\n\nPara ver todos os seus produtos cadastrados:\n\n1. Clique em 'Catálogo de Produtos' no menu superior\n2. Lá você verá todos os produtos com:\n   • Nome e descrição\n   • Preço\n   • Categoria\n   • Opções para editar ou remover\n\nVocê também pode filtrar por categoria!",
    "lista": "🛒 **Criar Lista de Compras**\n\nVou te explicar como funciona:\n\n1. Acesse 'Lista de Compras' no menu\n2. Selecione os produtos do catálogo que deseja adicionar\n3. Ajuste as quantidades conforme necessário\n4. Marque os itens como comprados ao pegá-los\n5. Você pode salvar a lista para usar depois!\n\nMuito prático para não esquecer nada nas compras! 📝",
    "compra": "🛒 **Criar Lista de Compras**\n\nVou te explicar como funciona:\n\n1. Acesse 'Lista de Compras' no menu\n2. Selecione os produtos do catálogo que deseja adicionar\n3. Ajuste as quantidades conforme necessário\n4. Marque os itens como comprados ao pegá-los\n5. Você pode salvar a lista para usar depois!\n\nMuito prático para não esquecer nada nas compras! 📝",
    "acessibilidade": "♿ **Configurar Acessibilidade**\n\nNosso app é inclusivo! Temos várias opções:\n\n🔊 **Leitor de Tela** - Lê todos os textos em voz alta\n🎨 **Alto Contraste** - Melhora a visualização\n⏸️ **Reduzir Animações** - Para quem prefere menos movimento\n🔤 **Ajustar Tamanho da Fonte** - Deixe do tamanho ideal para você\n\nPara ativar:\n1. Clique no ícone de acessibilidade no canto inferior direito\n2. Escolha as opções que precisa\n\nTodos podem usar nosso app confortavelmente! 💙",
    "suporte": "📞 **Falar com o Suporte**\n\nEstamos aqui para ajudar!\n\n**Opções de contato:**\n• Acesse a aba 'Suporte' no menu superior\n• Envie um e-mail: suporte@concierge.com\n• Nossa equipe responde em até 24 horas\n\nPara um atendimento mais rápido, descreva detalhadamente sua dúvida ou problema.",
    "ajuda": "✨ **Todas as Funcionalidades**\n\nVeja tudo que nosso app oferece:\n\n1️⃣ **Adicionar Produtos** - Cadastre itens com nome, preço e categoria\n2️⃣ **Catálogo de Produtos** - Visualize e gerencie seus produtos\n3️⃣ **Lista de Compras** - Crie e organize suas compras\n4️⃣ **Dashboard** - Veja estatísticas e resumos\n5️⃣ **Acessibilidade** - Recursos para todos os usuários\n6️⃣ **Suporte** - Tire suas dúvidas com nossa equipe\n7️⃣ **Guia do Usuário** - Tutorial completo do app\n\nDigite o número da funcionalidade para saber mais detalhes! 😊",
    "menu": "✨ **Todas as Funcionalidades**\n\nVeja tudo que nosso app oferece:\n\n1️⃣ **Adicionar Produtos** - Cadastre itens com nome, preço e categoria\n2️⃣ **Catálogo de Produtos** - Visualize e gerencie seus produtos\n3️⃣ **Lista de Compras** - Crie e organize suas compras\n4️⃣ **Dashboard** - Veja estatísticas e resumos\n5️⃣ **Acessibilidade** - Recursos para todos os usuários\n6️⃣ **Suporte** - Tire suas dúvidas com nossa equipe\n7️⃣ **Guia do Usuário** - Tutorial completo do app\n\nDigite o número da funcionalidade para saber mais detalhes! 😊"
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.trim().toLowerCase();
    
    // Reconhecer respostas afirmativas (sim)
    if (lowerMessage.match(/^(sim|s|yes|y|claro|com certeza|isso|exato|correto)$/)) {
      return "Que bom! 😊 Fico feliz em poder ajudar. Estou à disposição se precisar de mais alguma coisa!";
    }
    
    // Reconhecer respostas negativas (não)
    if (lowerMessage.match(/^(não|nao|n|no|negativo|de jeito nenhum|nunca)$/)) {
      return "Tudo bem! Estou à disposição sempre que precisar. 😊 Se tiver alguma dúvida, é só me chamar!";
    }
    
    // Reconhecer agradecimentos
    if (lowerMessage.match(/(obrigad|valeu|thanks|brigad)/)) {
      return "Por nada! 💙 Estou aqui para ajudar sempre que precisar. Tenha um ótimo dia!";
    }
    
    // Check for number options first (1-6)
    if (lowerMessage.match(/^[1-6]$/)) {
      return quickResponses[lowerMessage];
    }
    
    // Check for keyword matches
    for (const [key, response] of Object.entries(quickResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Default response with suggestions
    return "Hmm, não consegui entender exatamente o que você precisa. 🤔\n\nMas não se preocupe! Posso ajudar com:\n\n1️⃣ Adicionar produtos\n2️⃣ Ver catálogo\n3️⃣ Criar lista de compras\n4️⃣ Configurar acessibilidade\n5️⃣ Falar com suporte\n6️⃣ Ver todas as funcionalidades\n\nDigite o número da opção ou tente descrever de outra forma! 😊";
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
      playNotificationSound(); // Toca som quando bot responde
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
    <div className="fixed bottom-6 right-6 z-40">
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
              Concierge.AI - Assistente Virtual
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              Sua assistente de compras inteligentes
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
                        <span className="text-xs font-semibold">Concierge.AI</span>
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
              <div ref={messagesEndRef} />
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
