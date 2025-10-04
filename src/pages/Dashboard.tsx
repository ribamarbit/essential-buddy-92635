import { useState, useEffect } from "react";
import DashboardStats from "@/components/dashboard-stats";
import ItemCard from "@/components/item-card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface EssentialItem {
  id: string;
  name: string;
  icon: string;
  daysLeft: number;
  totalDays: number;
  status: "success" | "warning" | "urgent";
  estimatedPrice: number;
  startDate: number; // Timestamp de quando o item foi adicionado/reabastecido
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
  
  // Carrega itens do localStorage
  const [essentialItems, setEssentialItems] = useState<EssentialItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  // Itens essenciais marcados
  const essentialItemNames = ['Café', 'Leite', 'Arroz', 'Feijão', 'Açúcar', 'Óleo'];

  useEffect(() => {
    // Carrega produtos cadastrados
    const storedProducts = localStorage.getItem('catalogProducts');
    const storedTimestamps = localStorage.getItem('productTimestamps');
    
    if (storedProducts) {
      try {
        const products = JSON.parse(storedProducts);
        const timestamps = storedTimestamps ? JSON.parse(storedTimestamps) : {};
        
        const items: EssentialItem[] = products.map((product: any) => {
          // Usa timestamp fixo armazenado ou cria um novo
          const startDate = timestamps[product.id] || Date.now();
          
          // Se não existia timestamp, salva o novo
          if (!timestamps[product.id]) {
            timestamps[product.id] = startDate;
          }
          
          // Calcular dias restantes baseado na quantidade e tempo decorrido
          const totalDays = Math.max(30, product.quantity * 2 || 30);
          const daysPassed = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24));
          const daysLeft = Math.max(0, totalDays - daysPassed);
          
          let status: "success" | "warning" | "urgent" = "success";
          if (daysLeft <= 2) status = "urgent";
          else if (daysLeft <= 5) status = "warning";
          
          return {
            id: product.id,
            name: product.name,
            icon: product.icon || "📦",
            daysLeft,
            totalDays,
            status,
            estimatedPrice: product.price,
            startDate
          };
        });
        
        // Salva timestamps atualizados
        localStorage.setItem('productTimestamps', JSON.stringify(timestamps));
        setEssentialItems(items);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      }
    } else {
      // Dados padrão caso não haja produtos cadastrados
      const defaultStartDate = Date.now() - (13 * 24 * 60 * 60 * 1000); // 13 dias atrás
      setEssentialItems([
        {
          id: "1",
          name: "Café",
          icon: "☕",
          daysLeft: 2,
          totalDays: 15,
          status: "urgent",
          estimatedPrice: 12.90,
          startDate: defaultStartDate
        },
        {
          id: "2", 
          name: "Leite",
          icon: "🥛",
          daysLeft: 5,
          totalDays: 7,
          status: "warning",
          estimatedPrice: 4.50,
          startDate: Date.now() - (2 * 24 * 60 * 60 * 1000)
        },
        {
          id: "3",
          name: "Arroz",
          icon: "🍚",
          daysLeft: 12,
          totalDays: 30,
          status: "success",
          estimatedPrice: 8.99,
          startDate: Date.now() - (18 * 24 * 60 * 60 * 1000)
        }
      ]);
    }

    // Carrega lista de compras
    const storedList = localStorage.getItem('shoppingList');
    if (storedList) {
      try {
        setShoppingList(JSON.parse(storedList));
      } catch (error) {
        console.error('Erro ao carregar lista:', error);
      }
    }
  }, []);

  // Atualiza o cálculo de dias apenas uma vez por dia (não constantemente)
  useEffect(() => {
    // Atualiza apenas a cada hora para recalcular dias restantes
    const interval = setInterval(() => {
      const storedProducts = localStorage.getItem('catalogProducts');
      const storedTimestamps = localStorage.getItem('productTimestamps');
      
      if (storedProducts && storedTimestamps) {
        try {
          const products = JSON.parse(storedProducts);
          const timestamps = JSON.parse(storedTimestamps);
          
          const items: EssentialItem[] = products.map((product: any) => {
            const startDate = timestamps[product.id] || Date.now();
            const totalDays = Math.max(30, product.quantity * 2 || 30);
            const daysPassed = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24));
            const daysLeft = Math.max(0, totalDays - daysPassed);
            
            let status: "success" | "warning" | "urgent" = "success";
            if (daysLeft <= 2) status = "urgent";
            else if (daysLeft <= 5) status = "warning";
            
            return {
              id: product.id,
              name: product.name,
              icon: product.icon || "📦",
              daysLeft,
              totalDays,
              status,
              estimatedPrice: product.price,
              startDate
            };
          });
          setEssentialItems(items);
        } catch (error) {
          console.error('Erro ao atualizar produtos:', error);
        }
      }
    }, 3600000); // Atualiza apenas a cada hora (não a cada 3 segundos)

    return () => clearInterval(interval);
  }, []);

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

    const updatedList = [...shoppingList, newShoppingItem];
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
    
    toast({
      title: "Adicionado à lista! ✅",
      description: `${item.name} foi adicionado à sua lista de compras.`
    });
  };

  return (
    <div className="min-h-screen bg-background">
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
              <div key={item.id} className="relative">
                {essentialItemNames.includes(item.name) && (
                  <Badge 
                    className="absolute -top-2 -right-2 z-10 bg-yellow-500 text-yellow-950 hover:bg-yellow-600"
                  >
                    ⭐ Essencial
                  </Badge>
                )}
                <ItemCard
                  {...item}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;