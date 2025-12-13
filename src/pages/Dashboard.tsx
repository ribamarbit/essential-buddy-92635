/**
 * =============================================================================
 * DASHBOARD.TSX - Página Principal do Dashboard
 * =============================================================================
 * 
 * Esta é a página principal da aplicação após o login.
 * Exibe todos os itens essenciais cadastrados pelo usuário com:
 * - Contagem regressiva de dias até acabar
 * - Status visual (verde/amarelo/vermelho)
 * - Estatísticas gerais
 * - Opção de adicionar à lista de compras
 * 
 * Fluxo de dados:
 * - Itens são carregados do localStorage (chave: 'dashboardEssentials')
 * - Itens são adicionados via página AddItems ou Scanner
 * 
 * =============================================================================
 */

import { useState, useEffect } from "react";

// Componentes da aplicação
import DashboardStats from "@/components/dashboard-stats";
import ItemCard from "@/components/item-card";

// Hook de notificações
import { useToast } from "@/hooks/use-toast";

// Componente de badge para marcadores visuais
import { Badge } from "@/components/ui/badge";

/**
 * Interface que define a estrutura de um item essencial
 */
interface EssentialItem {
  id: string;              // Identificador único do item
  name: string;            // Nome do item (ex: "Café", "Leite")
  icon: string;            // Emoji representativo do item
  daysLeft: number;        // Dias restantes até acabar
  totalDays: number;       // Duração total do item (ciclo de consumo)
  status: "success" | "warning" | "urgent";  // Status visual baseado nos dias restantes
  estimatedPrice: number;  // Preço estimado do item
  startDate: number;       // Timestamp de quando o item foi adicionado/reabastecido
}

/**
 * Interface que define a estrutura de um item na lista de compras
 */
interface ShoppingItem {
  id: string;
  name: string;
  icon: string;
  priority: "urgent" | "warning" | "normal";
  estimatedPrice: number;
}

/**
 * Componente Dashboard
 * 
 * Exibe a visão geral dos itens essenciais do usuário
 */
const Dashboard = () => {
  const { toast } = useToast();
  
  // ============================================================================
  // ESTADOS
  // ============================================================================
  
  // Lista de itens essenciais exibidos no dashboard
  const [essentialItems, setEssentialItems] = useState<EssentialItem[]>([]);
  
  // Lista de compras (carregada para verificar duplicatas)
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  // Lista de nomes de itens considerados "essenciais" para badge especial
  const essentialItemNames = ['Café', 'Leite', 'Arroz', 'Feijão', 'Açúcar', 'Óleo'];

  /**
   * Função para carregar itens essenciais do localStorage
   */
  const loadEssentialItems = () => {
    const storedEssentials = localStorage.getItem('dashboardEssentials');
    
    if (storedEssentials) {
      try {
        const essentials = JSON.parse(storedEssentials);
        
        // Processa cada item para calcular dias restantes
        const items: EssentialItem[] = essentials.map((item: any) => {
          // Usa startDate armazenado ou data atual como fallback
          const startDate = item.startDate || Date.now();
          const totalDays = item.totalDays || 30;
          
          // Calcula dias passados desde o início
          const daysPassed = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24));
          
          // Calcula dias restantes (mínimo 0)
          const daysLeft = Math.max(0, totalDays - daysPassed);
          
          // Determina status baseado nos dias restantes
          let status: "success" | "warning" | "urgent" = "success";
          if (daysLeft <= 2) status = "urgent";      // Vermelho: 2 dias ou menos
          else if (daysLeft <= 5) status = "warning"; // Amarelo: 5 dias ou menos
          
          return {
            id: item.id || Date.now().toString(),
            name: item.name,
            icon: item.icon || "📦",
            daysLeft,
            totalDays,
            status,
            estimatedPrice: item.estimatedPrice || 5.0,
            startDate
          };
        });
        
        setEssentialItems(items);
      } catch {
        // Erro silencioso - não expõe detalhes
      }
    } else {
      // Se não houver itens salvos, usa dados de exemplo
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
          startDate: Date.now() - (2 * 24 * 60 * 60 * 1000) // 2 dias atrás
        },
        {
          id: "3",
          name: "Arroz",
          icon: "🍚",
          daysLeft: 12,
          totalDays: 30,
          status: "success",
          estimatedPrice: 8.99,
          startDate: Date.now() - (18 * 24 * 60 * 60 * 1000) // 18 dias atrás
        }
      ]);
    }
  };

  /**
   * Função para carregar lista de compras
   */
  const loadShoppingList = () => {
    const storedList = localStorage.getItem('shoppingList');
    if (storedList) {
      try {
        setShoppingList(JSON.parse(storedList));
      } catch {
        // Erro silencioso
      }
    }
  };

  /**
   * Effect inicial para carregar dados e configurar listeners
   */
  useEffect(() => {
    // Carrega dados iniciais
    loadEssentialItems();
    loadShoppingList();
    
    // Escuta atualizações do dashboard (scanner, etc.)
    const handleDashboardUpdate = () => loadEssentialItems();
    const handleShoppingListUpdate = () => loadShoppingList();
    const handleFocus = () => {
      loadEssentialItems();
      loadShoppingList();
    };
    
    window.addEventListener('dashboardUpdated', handleDashboardUpdate);
    window.addEventListener('shoppingListUpdated', handleShoppingListUpdate);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('dashboardUpdated', handleDashboardUpdate);
      window.removeEventListener('shoppingListUpdated', handleShoppingListUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  /**
   * Effect para atualização periódica dos dias restantes
   * Executa a cada hora para recalcular os dias restantes
   */
  useEffect(() => {
    const interval = setInterval(() => {
      loadEssentialItems();
    }, 3600000); // 3600000ms = 1 hora

    // Cleanup: limpa interval quando componente é desmontado
    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // ESTATÍSTICAS DO DASHBOARD
  // ============================================================================
  
  const stats = {
    // Quantidade de itens com status "urgent"
    itemsRunningOut: essentialItems.filter(item => item.status === "urgent").length,
    
    // Média de dias até repor (evita divisão por zero)
    avgDaysToRefill: Math.round(essentialItems.reduce((sum, item) => sum + item.daysLeft, 0) / essentialItems.length),
    
    // Quantidade de itens na lista de compras
    pendingItems: shoppingList.length,
    
    // Economia mensal estimada (valor fixo de exemplo)
    monthlySavings: 47.80
  };

  /**
   * Handler para adicionar item à lista de compras
   * 
   * @param itemId - ID do item a ser adicionado
   */
  const handleAddToCart = (itemId: string) => {
    // Encontra o item pelo ID
    const item = essentialItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Verifica se já está na lista de compras
    if (shoppingList.some(i => i.id === itemId)) {
      toast({
        title: "Item já na lista! 📝",
        description: `${item.name} já está na sua lista de compras.`
      });
      return;
    }

    // Cria novo item para lista de compras
    const newShoppingItem: ShoppingItem = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      // Mapeia status para prioridade
      priority: item.status === "urgent" ? "urgent" : item.status === "warning" ? "warning" : "normal",
      estimatedPrice: item.estimatedPrice
    };

    // Atualiza estado e localStorage
    const updatedList = [...shoppingList, newShoppingItem];
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
    
    toast({
      title: "Adicionado à lista! ✅",
      description: `${item.name} foi adicionado à sua lista de compras.`
    });
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* ================================================================
            SEÇÃO DE BOAS-VINDAS
            ================================================================ */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Olá! Vamos cuidar das suas compras? 😊
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Acompanhe seus itens essenciais e nunca mais esqueça de comprar o que precisa. 
            Sugestões inteligentes baseadas no seu consumo.
          </p>
        </div>

        {/* ================================================================
            CARDS DE ESTATÍSTICAS
            ================================================================ */}
        <DashboardStats stats={stats} />

        {/* ================================================================
            GRID DE ITENS ESSENCIAIS
            ================================================================ */}
        <div className="space-y-6">
          {/* Header da seção */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Seus Itens Essenciais
            </h2>
            <p className="text-sm text-muted-foreground">
              {/* Mostra alerta se houver itens acabando */}
              {stats.itemsRunningOut > 0 && (
                <span className="text-urgent font-medium">
                  {stats.itemsRunningOut} acabando!
                </span>
              )}
            </p>
          </div>
          
          {/* Grid responsivo de cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {essentialItems.map((item) => (
              <div key={item.id} className="relative">
                {/* Badge "Essencial" para itens da lista essencial */}
                {essentialItemNames.includes(item.name) && (
                  <Badge 
                    className="absolute -top-2 -right-2 z-10 bg-yellow-500 text-yellow-950 hover:bg-yellow-600"
                  >
                    ⭐ Essencial
                  </Badge>
                )}
                {/* Card do item com todas as informações */}
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
