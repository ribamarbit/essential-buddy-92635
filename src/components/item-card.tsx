import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  id: string;
  name: string;
  icon: string;
  daysLeft: number;
  totalDays: number;
  status: "success" | "warning" | "urgent";
  onAddToCart: (id: string) => void;
}

const statusConfig = {
  success: { chipBg: "bg-primary-fixed", chipText: "text-primary", barColor: "bg-primary", borderAccent: "" },
  warning: { chipBg: "bg-warning-light", chipText: "text-warning-foreground", barColor: "bg-warning", borderAccent: "" },
  urgent: { chipBg: "bg-tertiary-fixed", chipText: "text-tertiary", barColor: "bg-tertiary-container", borderAccent: "border-l-4 border-tertiary-container" },
};

const ItemCard = ({ id, name, icon, daysLeft, totalDays, status, onAddToCart }: ItemCardProps) => {
  const config = statusConfig[status];
  const progressPercent = totalDays > 0 ? Math.max(0, Math.min(100, (daysLeft / totalDays) * 100)) : 0;

  return (
    <div className={cn(
      "p-5 rounded-3xl flex items-center gap-6 group transition-all duration-300",
      status === "urgent"
        ? "bg-surface-container-lowest shadow-sm border-l-4 border-tertiary-container hover:shadow-md"
        : "bg-surface-container-low hover:bg-surface-container-high"
    )}>
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-grow flex justify-between items-center">
        <div>
          <span className={cn(
            "font-label text-[10px] uppercase tracking-widest",
            status === "urgent" ? "text-tertiary-container font-bold" : "text-muted-foreground"
          )}>
            {status === "urgent" ? "Crítico" : status === "warning" ? "Atenção" : "Estável"}
          </span>
          <h4 className="text-lg font-bold text-foreground mt-1">{name}</h4>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className={cn("px-4 py-1 rounded-full text-xs font-bold", config.chipBg, config.chipText)}>
              {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
            </span>
            <button
              onClick={() => onAddToCart(id)}
              className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
          <div className="h-1.5 w-32 bg-surface-variant rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", config.barColor)} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
