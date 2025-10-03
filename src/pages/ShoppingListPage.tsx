import { useState, useEffect } from "react";
import ShoppingList from "@/components/shopping-list";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface ShoppingItem {
  id: string;
  name: string;
  icon: string;
  priority: "urgent" | "warning" | "normal";
  estimatedPrice: number;
}

const ShoppingListPage = () => {
  const { toast } = useToast();
  
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  // Carrega lista do localStorage
  useEffect(() => {
    const storedList = localStorage.getItem('shoppingList');
    if (storedList) {
      try {
        setShoppingList(JSON.parse(storedList));
      } catch (error) {
        console.error('Erro ao carregar lista:', error);
      }
    }
  }, []);

  const handleRemoveFromCart = (itemId: string) => {
    const item = shoppingList.find(i => i.id === itemId);
    const updatedList = shoppingList.filter(i => i.id !== itemId);
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
    
    if (item) {
      toast({
        title: "Removido da lista",
        description: `${item.name} foi removido da sua lista de compras.`
      });
    }
  };

  const handleCheckout = () => {
    if (shoppingList.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Adicione itens à sua lista antes de finalizar.",
        variant: "destructive"
      });
      return;
    }

    // Simula finalização de compra
    const total = shoppingList.reduce((sum, item) => sum + item.estimatedPrice, 0);
    
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

  const handleShareList = async () => {
    if (shoppingList.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Adicione itens à sua lista antes de compartilhar.",
        variant: "destructive"
      });
      return;
    }

    const listText = `🛒 Minha Lista de Compras - Concierge\n\n${shoppingList.map((item, index) => 
      `${index + 1}. ${item.icon} ${item.name} - R$ ${item.estimatedPrice.toFixed(2)}`
    ).join('\n')}\n\n💰 Total: R$ ${totalValue.toFixed(2)}`;

    try {
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
        // Fallback: copiar para área de transferência
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

  const totalValue = shoppingList.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const urgentItems = shoppingList.filter(item => item.priority === "urgent").length;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Sua Lista de Compras
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {shoppingList.length > 0 
              ? `${shoppingList.length} itens • Total estimado: R$ ${totalValue.toFixed(2)}`
              : "Sua lista está vazia. Adicione itens do dashboard."
            }
          </p>
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

        {/* Stats cards */}
        {shoppingList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{shoppingList.length}</div>
              <div className="text-sm text-muted-foreground">Total de Itens</div>
            </div>
            
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-urgent">{urgentItems}</div>
              <div className="text-sm text-muted-foreground">Itens Urgentes</div>
            </div>
            
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">R$ {totalValue.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Valor Estimado</div>
            </div>
          </div>
        )}

        {/* Shopping List */}
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