/**
 * =============================================================================
 * SHOPPINGLISTPAGE.TSX - Página da Lista de Compras
 * =============================================================================
 * 
 * Esta página exibe a lista de compras do usuário com todos os itens
 * adicionados através do Catálogo de Produtos ou Dashboard.
 * 
 * Funcionalidades:
 * - Visualizar itens da lista de compras
 * - Remover itens da lista
 * - Compartilhar lista (nativo ou copiar para clipboard)
 * - Finalizar compra (limpa a lista)
 * - Estatísticas (total de itens, urgentes, valor estimado)
 * 
 * Fluxo de dados:
 * - Carrega itens do localStorage (shoppingList)
 * - Sincroniza alterações de volta ao localStorage
 * 
 * =============================================================================
 */

// Importações do React
import { useState, useEffect } from "react";

// Componentes
import ShoppingList from "@/components/shopping-list";

// Hooks
import { useToast } from "@/hooks/use-toast";

// Componentes de UI
import { Button } from "@/components/ui/button";

// Ícones
import { Share2 } from "lucide-react";

/**
 * Interface que define a estrutura de um item da lista de compras
 */
interface ShoppingItem {
  id: string;                              // Identificador único
  name: string;                            // Nome do produto
  icon: string;                            // Emoji representativo
  priority: "urgent" | "warning" | "normal"; // Prioridade do item
  estimatedPrice: number;                  // Preço estimado
}

/**
 * Componente principal da página de Lista de Compras
 */
const ShoppingListPage = () => {
  // Hook para notificações toast
  const { toast } = useToast();
  
  // Estado da lista de compras
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  /**
   * Função para carregar a lista do localStorage
   */
  const loadShoppingList = () => {
    try {
      const storedList = localStorage.getItem('shoppingList');
      if (storedList) {
        const parsed = JSON.parse(storedList);
        if (Array.isArray(parsed)) {
          setShoppingList(parsed);
        } else {
          setShoppingList([]);
        }
      } else {
        setShoppingList([]);
      }
    } catch {
      console.error('Erro ao carregar lista de compras');
      setShoppingList([]);
    }
  };

  /**
   * Carrega a lista na inicialização e quando há mudanças
   * Escuta eventos customizados para sincronizar na mesma aba
   */
  useEffect(() => {
    // Carrega inicialmente
    loadShoppingList();

    // Recarrega quando a janela ganha foco
    const handleFocus = () => {
      loadShoppingList();
    };
    
    // Escuta mudanças no localStorage de outras abas
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'shoppingList') {
        loadShoppingList();
      }
    };
    
    // Escuta evento customizado para atualizações na mesma aba
    const handleCustomUpdate = () => {
      loadShoppingList();
    };

    // Polling a cada 1 segundo como fallback para garantir sincronização
    const interval = setInterval(() => {
      loadShoppingList();
    }, 1000);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('shoppingListUpdated', handleCustomUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('shoppingListUpdated', handleCustomUpdate);
    };
  }, []);

  /**
   * Remove um item da lista de compras
   * Atualiza tanto o estado quanto o localStorage
   * 
   * @param itemId - ID do item a ser removido
   */
  const handleRemoveFromCart = (itemId: string) => {
    const item = shoppingList.find(i => i.id === itemId);
    const updatedList = shoppingList.filter(i => i.id !== itemId);
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
    
    // Notifica o usuário
    if (item) {
      toast({
        title: "Removido da lista",
        description: `${item.name} foi removido da sua lista de compras.`
      });
    }
  };

  /**
   * Finaliza a compra
   * Mostra o total e limpa a lista após 2 segundos
   */
  const handleCheckout = () => {
    // Verifica se há itens na lista
    if (shoppingList.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Adicione itens à sua lista antes de finalizar.",
        variant: "destructive"
      });
      return;
    }

    // Calcula o total
    const total = shoppingList.reduce((sum, item) => sum + item.estimatedPrice, 0);
    
    // Notifica com resumo
    toast({
      title: "Lista de compras finalizada! ✅",
      description: `Total: R$ ${total.toFixed(2)} • ${shoppingList.length} ${shoppingList.length === 1 ? 'item' : 'itens'}. Boa compra!`
    });
    
    // Limpa a lista após 2 segundos
    setTimeout(() => {
      setShoppingList([]);
      localStorage.setItem('shoppingList', JSON.stringify([]));
      toast({
        title: "Lista limpa!",
        description: "Sua lista foi resetada. Adicione novos itens quando precisar."
      });
    }, 2000);
  };

  /**
   * Compartilha a lista de compras
   * Usa a Web Share API se disponível, senão copia para clipboard
   */
  const handleShareList = async () => {
    // Verifica se há itens
    if (shoppingList.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Adicione itens à sua lista antes de compartilhar.",
        variant: "destructive"
      });
      return;
    }

    // Formata o texto da lista
    const listText = `🛒 Minha Lista de Compras - Concierge\n\n${shoppingList.map((item, index) => 
      `${index + 1}. ${item.icon} ${item.name} - R$ ${item.estimatedPrice.toFixed(2)}`
    ).join('\n')}\n\n💰 Total: R$ ${totalValue.toFixed(2)}`;

    try {
      // Tenta usar a Web Share API (disponível em mobile)
      if (navigator.share) {
        await navigator.share({
          title: 'Lista de Compras - Concierge',
          text: listText
        });
        toast({
          title: "Lista compartilhada! ✅",
          description: "Sua lista foi compartilhada com sucesso."
        });
      } else {
        // Fallback: copia para área de transferência
        await navigator.clipboard.writeText(listText);
        toast({
          title: "Lista copiada! 📋",
          description: "A lista foi copiada para a área de transferência."
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar a lista.",
        variant: "destructive"
      });
    }
  };

  // Calcula estatísticas
  const totalValue = shoppingList.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const urgentItems = shoppingList.filter(item => item.priority === "urgent").length;

  // ==========================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ==========================================================================
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* ================================================================
            CABEÇALHO DA PÁGINA
            ================================================================ */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Sua Lista de Compras
          </h1>
          {/* Subtítulo com estatísticas ou mensagem de lista vazia */}
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {shoppingList.length > 0 
              ? `${shoppingList.length} itens • Total estimado: R$ ${totalValue.toFixed(2)}`
              : "Sua lista está vazia. Adicione itens do dashboard."
            }
          </p>
          {/* Botão de compartilhar (só aparece se houver itens) */}
          {shoppingList.length > 0 && (
            <Button 
              onClick={handleShareList}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar Lista
            </Button>
          )}
        </div>

        {/* ================================================================
            CARDS DE ESTATÍSTICAS
            Só aparecem se houver itens na lista
            ================================================================ */}
        {shoppingList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total de itens */}
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{shoppingList.length}</div>
              <div className="text-sm text-muted-foreground">Total de Itens</div>
            </div>
            
            {/* Itens urgentes */}
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-urgent">{urgentItems}</div>
              <div className="text-sm text-muted-foreground">Itens Urgentes</div>
            </div>
            
            {/* Valor estimado */}
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">R$ {totalValue.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Valor Estimado</div>
            </div>
          </div>
        )}

        {/* ================================================================
            COMPONENTE DA LISTA DE COMPRAS
            Centralizado com largura máxima
            ================================================================ */}
        <div className="max-w-md mx-auto">
          <ShoppingList
            items={shoppingList}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
          />
        </div>
      </main>
    </div>
  );
};

export default ShoppingListPage;
