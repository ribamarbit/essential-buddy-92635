import { useState } from "react";
import ShoppingList from "@/components/shopping-list";
import { useToast } from "@/hooks/use-toast";

interface ShoppingItem {
  id: string;
  name: string;
  icon: string;
  priority: "urgent" | "warning" | "normal";
  estimatedPrice: number;
}

const ShoppingListPage = () => {
  const { toast } = useToast();
  
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    {
      id: "1",
      name: "Café",
      icon: "☕",
      priority: "urgent",
      estimatedPrice: 12.90
    },
    {
      id: "2",
      name: "Açúcar",
      icon: "🍯",
      priority: "urgent",
      estimatedPrice: 3.20
    },
    {
      id: "3",
      name: "Sabão",
      icon: "🧼",
      priority: "warning",
      estimatedPrice: 6.75
    }
  ]);

  const handleRemoveFromCart = (itemId: string) => {
    const item = shoppingList.find(i => i.id === itemId);
    setShoppingList(prev => prev.filter(i => i.id !== itemId));
    
    if (item) {
      toast({
        title: "Removido da lista",
        description: `${item.name} foi removido da sua lista de compras.`
      });
    }
  };

  const handleCheckout = () => {
    toast({
      title: "Redirecionando para o checkout! 🛒",
      description: "Em breve você será direcionado para finalizar sua compra."
    });
  };

  const totalValue = shoppingList.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const urgentItems = shoppingList.filter(item => item.priority === "urgent").length;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Sua Lista de Compras
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {shoppingList.length > 0 
              ? `${shoppingList.length} itens • Total estimado: R$ ${totalValue.toFixed(2)}`
              : "Sua lista está vazia. Adicione itens do dashboard."
            }
          </p>
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