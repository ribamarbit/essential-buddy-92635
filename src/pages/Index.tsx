/**
 * =============================================================================
 * INDEX.TSX - Página Principal (Home/Dashboard)
 * =============================================================================
 * 
 * Esta é a página inicial do aplicativo após o login.
 * Exibe uma visão geral dos itens essenciais e a lista de compras.
 * 
 * NOTA: Esta página usa dados mockados para demonstração.
 * Em produção, os dados seriam carregados do localStorage ou banco de dados.
 * 
 * Funcionalidades:
 * - Mensagem de boas-vindas
 * - Estatísticas do dashboard
 * - Grid de itens essenciais com status
 * - Lista de compras rápida
 * 
 * Fluxo de dados:
 * - Items essenciais → podem ser adicionados ao carrinho
 * - Lista de compras → pode remover itens ou fazer checkout
 * 
 * =============================================================================
 */

// Importações do React
import { useState } from "react";

// Componentes
import Header from "@/components/header";
import DashboardStats from "@/components/dashboard-stats";
import ItemCard from "@/components/item-card";
import ShoppingList from "@/components/shopping-list";

// Hooks
import { useToast } from "@/hooks/use-toast";

/**
 * Interface que define a estrutura de um item essencial
 */
interface EssentialItem {
  id: string;                              // Identificador único
  name: string;                            // Nome do produto
  icon: string;                            // Emoji representativo
  daysLeft: number;                        // Dias restantes até acabar
  totalDays: number;                       // Duração total em dias
  status: "success" | "warning" | "urgent"; // Status baseado em daysLeft
  estimatedPrice: number;                  // Preço estimado
}

/**
 * Interface que define a estrutura de um item da lista de compras
 */
interface ShoppingItem {
  id: string;                              // Identificador único
  name: string;                            // Nome do produto
  icon: string;                            // Emoji representativo
  priority: "urgent" | "warning" | "normal"; // Prioridade visual
  estimatedPrice: number;                  // Preço estimado
}

/**
 * Componente principal da página Index (Home)
 */
const Index = () => {
  // Hook para notificações toast
  const { toast } = useToast();
  
  /**
   * Dados mockados de itens essenciais para demonstração
   * Em produção, seriam carregados do localStorage/banco de dados
   * 
   * Status é determinado pela quantidade de dias restantes:
   * - urgent: poucos dias restantes (vermelho)
   * - warning: dias restantes moderados (amarelo)
   * - success: muitos dias restantes (verde)
   */
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

  // Estado da lista de compras (começa com um item de exemplo)
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    {
      id: "1",
      name: "Café",
      icon: "☕",
      priority: "urgent",
      estimatedPrice: 12.90
    }
  ]);

  /**
   * Calcula estatísticas para o dashboard
   * - itemsRunningOut: itens com status urgent
   * - avgDaysToRefill: média de dias restantes
   * - pendingItems: quantidade de itens na lista de compras
   * - monthlySavings: economia mensal estimada (mockado)
   */
  const stats = {
    itemsRunningOut: essentialItems.filter(item => item.status === "urgent").length,
    avgDaysToRefill: Math.round(essentialItems.reduce((sum, item) => sum + item.daysLeft, 0) / essentialItems.length),
    pendingItems: shoppingList.length,
    monthlySavings: 47.80
  };

  /**
   * Adiciona um item essencial à lista de compras
   * Verifica se o item já está na lista antes de adicionar
   * 
   * @param itemId - ID do item a ser adicionado
   */
  const handleAddToCart = (itemId: string) => {
    const item = essentialItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Verifica se já está na lista
    if (shoppingList.some(i => i.id === itemId)) {
      toast({
        title: "Item já na lista! 📝",
        description: `${item.name} já está na sua lista de compras.`
      });
      return;
    }

    // Cria item para a lista de compras
    const newShoppingItem: ShoppingItem = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      priority: item.status === "urgent" ? "urgent" : item.status === "warning" ? "warning" : "normal",
      estimatedPrice: item.estimatedPrice
    };

    // Adiciona à lista
    setShoppingList(prev => [...prev, newShoppingItem]);
    
    toast({
      title: "Adicionado à lista! ✅",
      description: `${item.name} foi adicionado à sua lista de compras.`
    });
  };

  /**
   * Remove um item da lista de compras
   * 
   * @param itemId - ID do item a ser removido
   */
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

  /**
   * Simula processo de checkout
   * Em produção, redirecionaria para pagamento/confirmação
   */
  const handleCheckout = () => {
    toast({
      title: "Redirecionando para o checkout! 🛒",
      description: "Em breve você será direcionado para finalizar sua compra."
    });
  };

  // ==========================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ==========================================================================
  return (
    <div className="min-h-screen bg-background">
      {/* Header com contador de notificações */}
      <Header notificationCount={stats.itemsRunningOut} />
      
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
            ESTATÍSTICAS DO DASHBOARD
            Cards com métricas importantes
            ================================================================ */}
        <DashboardStats stats={stats} />

        {/* ================================================================
            GRID PRINCIPAL
            Itens essenciais (2/3) + Lista de compras (1/3)
            ================================================================ */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna: Itens Essenciais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cabeçalho da seção */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Seus Itens Essenciais
              </h2>
              {/* Indicador de itens acabando */}
              <p className="text-sm text-muted-foreground">
                {stats.itemsRunningOut > 0 && (
                  <span className="text-urgent font-medium">
                    {stats.itemsRunningOut} acabando!
                  </span>
                )}
              </p>
            </div>
            
            {/* Grid de cards de itens */}
            <div className="grid sm:grid-cols-2 gap-4">
              {essentialItems.map((item) => (
                <ItemCard
                  key={item.id}
                  {...item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>

          {/* Coluna: Lista de Compras */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Lista de Compras
            </h2>
            
            {/* Componente de lista de compras */}
            <ShoppingList
              items={shoppingList}
              onRemoveItem={handleRemoveFromCart}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
