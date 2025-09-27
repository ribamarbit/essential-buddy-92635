import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Trash2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShoppingItem {
  id: string;
  name: string;
  icon: string;
  priority: "urgent" | "warning" | "normal";
  estimatedPrice: number;
}

interface ShoppingListProps {
  items: ShoppingItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

const priorityConfig = {
  urgent: {
    color: "bg-urgent text-urgent-foreground",
    label: "Urgente"
  },
  warning: {
    color: "bg-warning text-warning-foreground", 
    label: "Em breve"
  },
  normal: {
    color: "bg-success text-success-foreground",
    label: "Normal"
  }
};

const ShoppingList = ({ items, onRemoveItem, onCheckout }: ShoppingListProps) => {
  const totalPrice = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
  
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center shadow-card">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          Lista vazia
        </h3>
        <p className="text-muted-foreground">
          Adicione itens da sua despensa para começar!
        </p>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              Lista de Compras
            </h2>
            <p className="text-primary-foreground/80 mt-1">
              {items.length} {items.length === 1 ? "item" : "itens"} • 
              Estimativa: R$ {totalPrice.toFixed(2)}
            </p>
          </div>
          
          <Button 
            onClick={onCheckout}
            variant="secondary"
            className="font-semibold"
          >
            Finalizar Compra
          </Button>
        </div>
      </div>

      {/* Items list */}
      <div className="p-6 space-y-4">
        {items.map((item) => {
          const config = priorityConfig[item.priority];
          
          return (
            <div 
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:shadow-elevated transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                
                <div>
                  <h4 className="font-medium text-card-foreground">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn("text-xs", config.color)}>
                      {config.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      R$ {item.estimatedPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveItem(item.id)}
                className="text-muted-foreground hover:text-urgent transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
        
        {/* Store suggestion */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Melhor opção: <strong>Mercado Central</strong> - Economia de R$ 3,50</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ShoppingList;