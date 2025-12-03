/**
 * =============================================================================
 * SHOPPING-LIST.TSX - Componente de Lista de Compras
 * =============================================================================
 * 
 * Componente que exibe a lista de compras do usuário.
 * Funcionalidades:
 * - Exibe itens com nome, ícone, prioridade e preço estimado
 * - Permite remover itens da lista
 * - Calcula total estimado da compra
 * - Botão para finalizar compra
 * - Sugestão de melhor local de compra
 * 
 * =============================================================================
 */

// Componentes de UI
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Ícones
import { ShoppingBag, Trash2, MapPin } from "lucide-react";

// Utilitário para classes condicionais
import { cn } from "@/lib/utils";

/**
 * Interface que define a estrutura de um item na lista de compras
 */
interface ShoppingItem {
  id: string;                                    // Identificador único
  name: string;                                  // Nome do item
  icon: string;                                  // Emoji representativo
  priority: "urgent" | "warning" | "normal";    // Nível de prioridade
  estimatedPrice: number;                        // Preço estimado em R$
}

/**
 * Props do componente ShoppingList
 */
interface ShoppingListProps {
  items: ShoppingItem[];              // Array de itens na lista
  onRemoveItem: (id: string) => void; // Callback para remover item
  onCheckout: () => void;             // Callback para finalizar compra
}

/**
 * Configuração visual para cada nível de prioridade
 * Define cores e labels para os badges de prioridade
 */
const priorityConfig = {
  urgent: {
    color: "bg-urgent text-urgent-foreground",  // Vermelho
    label: "Urgente"
  },
  warning: {
    color: "bg-warning text-warning-foreground", // Amarelo
    label: "Em breve"
  },
  normal: {
    color: "bg-success text-success-foreground", // Verde
    label: "Normal"
  }
};

/**
 * Componente ShoppingList
 * 
 * Renderiza a lista de compras completa com header, itens e sugestões
 */
const ShoppingList = ({ items, onRemoveItem, onCheckout }: ShoppingListProps) => {
  // Calcula o preço total estimado da lista
  const totalPrice = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
  
  // ============================================================================
  // ESTADO VAZIO - Exibe mensagem quando não há itens
  // ============================================================================
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center shadow-card">
        {/* Ícone grande de sacola de compras */}
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

  // ============================================================================
  // LISTA COM ITENS
  // ============================================================================
  return (
    <Card className="shadow-card">
      {/* ================================================================
          HEADER DA LISTA
          Exibe título, contagem de itens, total e botão de finalizar
          ================================================================ */}
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
          
          {/* Botão para finalizar a compra */}
          <Button 
            onClick={onCheckout}
            variant="secondary"
            className="font-semibold"
          >
            Finalizar Compra
          </Button>
        </div>
      </div>

      {/* ================================================================
          LISTA DE ITENS
          ================================================================ */}
      <div className="p-6 space-y-4">
        {items.map((item) => {
          // Obtém configuração de cor/label baseado na prioridade
          const config = priorityConfig[item.priority];
          
          return (
            <div 
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:shadow-elevated transition-all"
            >
              {/* Informações do item (ícone, nome, prioridade, preço) */}
              <div className="flex items-center gap-4">
                {/* Ícone do item em círculo */}
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                
                <div>
                  {/* Nome do item */}
                  <h4 className="font-medium text-card-foreground">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Badge de prioridade com cor dinâmica */}
                    <Badge className={cn("text-xs", config.color)}>
                      {config.label}
                    </Badge>
                    {/* Preço estimado */}
                    <span className="text-sm text-muted-foreground">
                      R$ {item.estimatedPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Botão de remover item */}
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
        
        {/* ================================================================
            SUGESTÃO DE LOJA
            Mostra a melhor opção de mercado (dados mockados)
            ================================================================ */}
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
