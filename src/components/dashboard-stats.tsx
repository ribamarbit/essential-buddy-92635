/**
 * =============================================================================
 * DASHBOARD-STATS.TSX - Cards de Estatísticas do Dashboard
 * =============================================================================
 * 
 * Componente que exibe os cards de estatísticas na página principal.
 * Mostra métricas importantes como:
 * - Itens acabando
 * - Média de dias para repor
 * - Itens na lista de compras
 * - Economia mensal estimada
 * 
 * =============================================================================
 */

// Componente Card do design system
import { Card } from "@/components/ui/card";

// Ícones do Lucide
import { TrendingDown, Clock, ShoppingCart, DollarSign } from "lucide-react";

/**
 * Props do componente DashboardStats
 * Define a estrutura dos dados de estatísticas
 */
interface DashboardStatsProps {
  stats: {
    itemsRunningOut: number;  // Quantidade de itens acabando
    avgDaysToRefill: number;  // Média de dias até repor
    pendingItems: number;     // Itens na lista de compras
    monthlySavings: number;   // Economia mensal em R$
  };
}

/**
 * Componente DashboardStats
 * 
 * Renderiza um grid de cards com estatísticas
 */
const DashboardStats = ({ stats }: DashboardStatsProps) => {
  /**
   * Configuração dos cards de estatísticas
   * Cada item define: ícone, label, valor, sufixo e cores
   */
  const statItems = [
    {
      icon: TrendingDown,
      label: "Acabando",
      value: stats.itemsRunningOut,
      suffix: stats.itemsRunningOut === 1 ? "item" : "itens",
      color: "text-urgent",      // Vermelho para urgência
      bgColor: "bg-urgent-light"
    },
    {
      icon: Clock,
      label: "Média p/ repor",
      value: stats.avgDaysToRefill,
      suffix: "dias",
      color: "text-primary",     // Cor primária
      bgColor: "bg-primary/10"
    },
    {
      icon: ShoppingCart,
      label: "Na lista",
      value: stats.pendingItems,
      suffix: stats.pendingItems === 1 ? "item" : "itens",
      color: "text-warning",     // Amarelo para atenção
      bgColor: "bg-warning-light"
    },
    {
      icon: DollarSign,
      label: "Economia mensal",
      value: `R$ ${stats.monthlySavings}`,
      suffix: "",                // Sem sufixo (valor já formatado)
      color: "text-success",     // Verde para positivo
      bgColor: "bg-success-light"
    }
  ];

  return (
    // Grid responsivo: 2 colunas em mobile, 4 em desktop
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        // Obtém o componente de ícone
        const Icon = item.icon;
        
        return (
          <Card 
            key={index} 
            className="p-4 shadow-card hover:shadow-elevated transition-all"
          >
            <div className="flex items-center gap-3">
              {/* Ícone em container colorido */}
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Label da estatística */}
                <p className="text-sm text-muted-foreground font-medium">
                  {item.label}
                </p>
                {/* Valor e sufixo */}
                <p className="text-lg font-bold text-card-foreground">
                  {item.value} 
                  {item.suffix && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {item.suffix}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
