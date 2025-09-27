import { useState } from "react";
import Header from "@/components/header";
import DashboardStats from "@/components/dashboard-stats";
import ItemCard from "@/components/item-card";
import { useToast } from "@/hooks/use-toast";

interface EssentialItem {
  id: string;
  name: string;
  icon: string;
  daysLeft: number;
  totalDays: number;
  status: "success" | "warning" | "urgent";
  estimatedPrice: number;
}

interface ShoppingItem {
  id: string;
  name: string;
  icon: string;
  priority: "urgent" | "warning" | "normal";
  estimatedPrice: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  
  // Mock data for essential items
  const [essentialItems] = useState<EssentialItem[]>([
    {
      id: "1",
      name: "Café",
      icon: "☕",
      daysLeft: 2,
      totalDays: 15,
      status: "urgent",
      estimatedPrice: 12.90
    },
    {
      id: "2", 
      name: "Leite",
      icon: "🥛",
      daysLeft: 5,
      totalDays: 7,
      status: "warning",
      estimatedPrice: 4.50
    },
    {
      id: "3",
      name: "Arroz",
      icon: "🍚",
      daysLeft: 12,
      totalDays: 30,
      status: "success",
      estimatedPrice: 8.99
    },
    {
      id: "4",
      name: "Sabão",
      icon: "🧼",
      daysLeft: 3,
      totalDays: 20,
      status: "warning",
      estimatedPrice: 6.75
    },
    {
      id: "5",
      name: "Ração Pet",
      icon: "🐶",
      daysLeft: 18,
      totalDays: 25,
      status: "success",
      estimatedPrice: 25.80
    },
    {
      id: "6",
      name: "Açúcar",
      icon: "🍯",
      daysLeft: 1,
      totalDays: 45,
      status: "urgent",
      estimatedPrice: 3.20
    }
  ]);

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    {
      id: "1",
      name: "Café",
      icon: "☕",
      priority: "urgent",
      estimatedPrice: 12.90
    }
  ]);

  // Dashboard stats
  const stats = {
    itemsRunningOut: essentialItems.filter(item => item.status === "urgent").length,
    avgDaysToRefill: Math.round(essentialItems.reduce((sum, item) => sum + item.daysLeft, 0) / essentialItems.length),
    pendingItems: shoppingList.length,
    monthlySavings: 47.80
  };

  const handleAddToCart = (itemId: string) => {
    const item = essentialItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Check if item already in shopping list
    if (shoppingList.some(i => i.id === itemId)) {
      toast({
        title: "Item já na lista! 📝",
        description: `${item.name} já está na sua lista de compras.`
      });
      return;
    }

    const newShoppingItem: ShoppingItem = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      priority: item.status === "urgent" ? "urgent" : item.status === "warning" ? "warning" : "normal",
      estimatedPrice: item.estimatedPrice
    };

    setShoppingList(prev => [...prev, newShoppingItem]);
    
    toast({
      title: "Adicionado à lista! ✅",
      description: `${item.name} foi adicionado à sua lista de compras.`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header notificationCount={stats.itemsRunningOut} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Olá! Vamos cuidar das suas compras? 😊
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Acompanhe seus itens essenciais e nunca mais esqueça de comprar o que precisa. 
            Sugestões inteligentes baseadas no seu consumo.
          </p>
        </div>

        {/* Dashboard stats */}
        <DashboardStats stats={stats} />

        {/* Essential items grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Seus Itens Essenciais
            </h2>
            <p className="text-sm text-muted-foreground">
              {stats.itemsRunningOut > 0 && (
                <span className="text-urgent font-medium">
                  {stats.itemsRunningOut} acabando!
                </span>
              )}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {essentialItems.map((item) => (
              <ItemCard
                key={item.id}
                {...item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;