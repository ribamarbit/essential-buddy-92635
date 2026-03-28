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
  const cards = [
    {
      icon: TrendingDown,
      label: "Itens acabando",
      value: String(stats.itemsRunningOut),
      subtitle: "Ações recomendadas hoje",
      bg: "bg-surface-container-highest/85 backdrop-blur-md",
      iconColor: "text-tertiary",
      shadow: "shadow-tinted",
    },
    {
      icon: Clock,
      label: "Reposição média",
      value: `${stats.avgDaysToRefill}d`,
      subtitle: "Eficiência logística estável",
      bg: "bg-primary-container",
      iconColor: "text-white",
      shadow: "shadow-[0_8px_24px_rgba(71,101,80,0.1)]",
      textWhite: true,
    },
    {
      icon: DollarSign,
      label: "Economia mensal",
      value: `R$ ${stats.monthlySavings}`,
      subtitle: "Otimização de desperdício",
      bg: "bg-secondary-container",
      iconColor: "text-secondary",
      shadow: "shadow-[0_8px_24px_rgba(181,141,114,0.1)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className={`${card.bg} p-8 rounded-[2rem] flex flex-col justify-between ${card.shadow} border border-border/10`}>
            <div>
              <Icon className={`w-6 h-6 ${card.iconColor} mb-4`} />
              <h3 className={`font-label text-sm uppercase tracking-[0.1em] ${card.textWhite ? 'text-white/80' : 'text-muted-foreground'}`}>
                {card.label}
              </h3>
            </div>
            <div className="mt-4">
              <span className={`text-5xl font-extrabold tracking-tighter ${card.textWhite ? 'text-white' : 'text-foreground'}`}>
                {card.value}
              </span>
              <p className={`text-sm mt-1 ${card.textWhite ? 'text-white/80' : 'text-muted-foreground'}`}>
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
