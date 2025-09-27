import { Card } from "@/components/ui/card";
import { TrendingDown, Clock, ShoppingCart, DollarSign } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    itemsRunningOut: number;
    avgDaysToRefill: number;
    pendingItems: number;
    monthlySavings: number;
  };
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statItems = [
    {
      icon: TrendingDown,
      label: "Acabando",
      value: stats.itemsRunningOut,
      suffix: stats.itemsRunningOut === 1 ? "item" : "itens",
      color: "text-urgent",
      bgColor: "bg-urgent-light"
    },
    {
      icon: Clock,
      label: "Média p/ repor",
      value: stats.avgDaysToRefill,
      suffix: "dias",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: ShoppingCart,
      label: "Na lista",
      value: stats.pendingItems,
      suffix: stats.pendingItems === 1 ? "item" : "itens",
      color: "text-warning",
      bgColor: "bg-warning-light"
    },
    {
      icon: DollarSign,
      label: "Economia mensal",
      value: `R$ ${stats.monthlySavings}`,
      suffix: "",
      color: "text-success",
      bgColor: "bg-success-light"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        
        return (
          <Card key={index} className="p-4 shadow-card hover:shadow-elevated transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground font-medium">
                  {item.label}
                </p>
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