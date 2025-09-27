import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, Clock } from "lucide-react";
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
  success: {
    bgGradient: "bg-gradient-success",
    shadow: "shadow-success",
    textColor: "text-success",
    bgColor: "bg-success-light",
    progressColor: "bg-success"
  },
  warning: {
    bgGradient: "bg-gradient-warning", 
    shadow: "shadow-warning",
    textColor: "text-warning-foreground",
    bgColor: "bg-warning-light",
    progressColor: "bg-warning"
  },
  urgent: {
    bgGradient: "bg-gradient-urgent",
    shadow: "shadow-urgent", 
    textColor: "text-urgent",
    bgColor: "bg-urgent-light",
    progressColor: "bg-urgent"
  }
};

const ItemCard = ({ id, name, icon, daysLeft, totalDays, status, onAddToCart }: ItemCardProps) => {
  const config = statusConfig[status];
  const progressValue = ((totalDays - daysLeft) / totalDays) * 100;
  
  const getStatusMessage = () => {
    if (status === "urgent") return "Acabando!";
    if (status === "warning") return "Quase acabando";
    return "Tranquilo";
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-0 transition-all duration-300 hover:scale-105 hover:-translate-y-1",
      config.shadow
    )}>
      {/* Status gradient bar */}
      <div className={cn("h-1 w-full", config.bgGradient)} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
              config.bgColor
            )}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-card-foreground">{name}</h3>
              <p className={cn("text-sm font-medium", config.textColor)}>
                {getStatusMessage()}
              </p>
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={() => onAddToCart(id)}
            className="shrink-0 transition-bounce hover:scale-110"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              Tempo restante
            </span>
            <span className={cn("font-medium", config.textColor)}>
              {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={progressValue} 
              className="h-2 bg-muted"
            />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(progressValue)}% consumido
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ItemCard;