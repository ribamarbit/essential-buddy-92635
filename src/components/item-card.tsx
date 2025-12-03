/**
 * =============================================================================
 * ITEM-CARD.TSX - Card de Item Essencial
 * =============================================================================
 * 
 * Componente que renderiza um card individual para cada item essencial.
 * Exibe:
 * - Ícone e nome do item
 * - Status visual (verde/amarelo/vermelho)
 * - Barra de progresso de consumo
 * - Dias restantes até acabar
 * - Botão para adicionar à lista de compras
 * 
 * =============================================================================
 */

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Ícones
import { ShoppingCart, Clock } from "lucide-react";

// Utilitário para classes condicionais
import { cn } from "@/lib/utils";

/**
 * Props do componente ItemCard
 */
interface ItemCardProps {
  id: string;                              // Identificador único do item
  name: string;                            // Nome do item
  icon: string;                            // Emoji representativo
  daysLeft: number;                        // Dias restantes até acabar
  totalDays: number;                       // Duração total do ciclo de consumo
  status: "success" | "warning" | "urgent"; // Status baseado nos dias restantes
  onAddToCart: (id: string) => void;       // Callback para adicionar ao carrinho
}

/**
 * Configuração visual para cada status
 * Define gradientes, sombras e cores para os diferentes estados
 */
const statusConfig = {
  success: {
    bgGradient: "bg-gradient-success",    // Gradiente verde
    shadow: "shadow-success",              // Sombra verde
    textColor: "text-success",             // Texto verde
    bgColor: "bg-success-light",           // Fundo verde claro
    progressColor: "bg-success"            // Barra de progresso verde
  },
  warning: {
    bgGradient: "bg-gradient-warning",     // Gradiente amarelo
    shadow: "shadow-warning",              // Sombra amarela
    textColor: "text-warning-foreground",  // Texto amarelo
    bgColor: "bg-warning-light",           // Fundo amarelo claro
    progressColor: "bg-warning"            // Barra de progresso amarela
  },
  urgent: {
    bgGradient: "bg-gradient-urgent",      // Gradiente vermelho
    shadow: "shadow-urgent",               // Sombra vermelha
    textColor: "text-urgent",              // Texto vermelho
    bgColor: "bg-urgent-light",            // Fundo vermelho claro
    progressColor: "bg-urgent"             // Barra de progresso vermelha
  }
};

/**
 * Componente ItemCard
 * 
 * Renderiza um card com informações visuais sobre o item essencial
 */
const ItemCard = ({ id, name, icon, daysLeft, totalDays, status, onAddToCart }: ItemCardProps) => {
  // Obtém configuração visual baseada no status
  const config = statusConfig[status];
  
  /**
   * Calcula o valor da barra de progresso de forma segura
   * - Evita divisão por zero
   * - Garante valor entre 0 e 100
   * - Mostra quanto foi consumido (não quanto resta)
   */
  const progressValue = totalDays > 0 
    ? Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100)) 
    : 0;
  
  /**
   * Retorna mensagem de status baseada no nível
   */
  const getStatusMessage = () => {
    if (status === "urgent") return "Acabando!";     // Vermelho
    if (status === "warning") return "Quase acabando"; // Amarelo
    return "Tranquilo";                               // Verde
  };

  return (
    <Card className={cn(
      // Classes base do card
      "relative overflow-hidden border-0 transition-all duration-300",
      // Efeito hover: escala e elevação
      "hover:scale-105 hover:-translate-y-1",
      // Sombra dinâmica baseada no status
      config.shadow
    )}>
      {/* ================================================================
          BARRA DE STATUS NO TOPO
          Gradiente colorido indicando status
          ================================================================ */}
      <div className={cn("h-1 w-full", config.bgGradient)} />
      
      <div className="p-6">
        {/* ================================================================
            HEADER DO CARD
            Ícone, nome, status e botão de adicionar
            ================================================================ */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Círculo com ícone do item */}
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
              config.bgColor  // Cor de fundo dinâmica
            )}>
              {icon}
            </div>
            <div>
              {/* Nome do item */}
              <h3 className="font-semibold text-lg text-card-foreground">{name}</h3>
              {/* Mensagem de status com cor dinâmica */}
              <p className={cn("text-sm font-medium", config.textColor)}>
                {getStatusMessage()}
              </p>
            </div>
          </div>
          
          {/* Botão para adicionar à lista de compras */}
          <Button
            size="sm"
            onClick={() => onAddToCart(id)}
            className="shrink-0 transition-bounce hover:scale-110"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>

        {/* ================================================================
            SEÇÃO DE PROGRESSO
            Dias restantes e barra de consumo
            ================================================================ */}
        <div className="space-y-3">
          {/* Header com ícone e dias restantes */}
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              Tempo restante
            </span>
            {/* Número de dias com cor dinâmica */}
            <span className={cn("font-medium", config.textColor)}>
              {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
            </span>
          </div>
          
          {/* Barra de progresso e porcentagem */}
          <div className="space-y-2">
            <Progress 
              value={progressValue} 
              className="h-2 bg-muted"
            />
            {/* Porcentagem consumida */}
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
