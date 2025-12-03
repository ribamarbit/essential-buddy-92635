/**
 * =============================================================================
 * ACCESSIBILITY-PANEL.TSX - Painel de Acessibilidade
 * =============================================================================
 * 
 * Componente que fornece recursos de acessibilidade para a aplicação.
 * Funcionalidades:
 * - Ajuste de tamanho de fonte (Normal/Grande/Muito Grande)
 * - Modo de alto contraste
 * - Redução de animações
 * - Leitor de tela com síntese de voz
 * 
 * O painel é acessado através de um botão flutuante no canto inferior esquerdo.
 * 
 * =============================================================================
 */

import { useState } from "react";

// Ícones
import { Accessibility, Type, Contrast, Zap, Volume2, X } from "lucide-react";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Hook customizado de acessibilidade
import { useAccessibility } from "@/hooks/useAccessibility";

// ============================================================================
// VARIÁVEIS GLOBAIS PARA LEITOR DE TELA
// ============================================================================

// Referência para a API de síntese de voz do navegador
let speechSynthesis: SpeechSynthesis;

// Flag para controlar se o leitor de tela está ativo
let isScreenReaderActive = false;

/**
 * Ativa o leitor de tela
 * 
 * Configura listeners para ler textos ao:
 * - Focar em elementos interativos (botões, inputs, links)
 * - Passar o mouse ou clicar em textos e títulos
 * - Exibir alertas ou toasts
 */
const activateScreenReader = () => {
  // Verifica suporte à API de síntese de voz
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis;
    isScreenReaderActive = true;
    
    /**
     * Função auxiliar para ler texto em voz alta
     * @param text - Texto a ser lido
     */
    const readText = (text: string) => {
      if (isScreenReaderActive && text) {
        speechSynthesis.cancel(); // Cancela qualquer leitura anterior
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';  // Idioma português brasileiro
        utterance.rate = 0.8;       // Velocidade ligeiramente reduzida
        utterance.pitch = 1;        // Tom normal
        speechSynthesis.speak(utterance);
      }
    };
    
    /**
     * Adiciona listeners aos elementos da página
     */
    const addListeners = () => {
      // Listener para elementos interativos (foco)
      document.querySelectorAll('button, a, input, select, textarea').forEach(element => {
        element.addEventListener('focus', () => {
          const text = element.getAttribute('aria-label') || 
                      element.textContent || 
                      element.getAttribute('placeholder') || 
                      'Elemento interativo';
          readText(text);
        });
      });
      
      // Listener para textos e títulos (hover e click)
      document.querySelectorAll('h1, h2, h3, h4, h5, h6, .text-lg, .text-xl, .text-sm, .font-semibold, .font-bold, p, span').forEach(element => {
        const clickHandler = () => {
          const text = element.textContent || element.getAttribute('aria-label') || '';
          if (text.trim()) {
            // Prefixo "Título:" para headings
            readText(`${element.tagName?.toLowerCase().startsWith('h') ? 'Título: ' : 'Texto: '}${text}`);
          }
        };
        
        // Adiciona listeners de hover e click
        element.addEventListener('mouseenter', clickHandler);
        element.addEventListener('click', clickHandler);
        
        // Torna elemento clicável visualmente
        (element as HTMLElement).style.cursor = 'pointer';
        element.setAttribute('tabindex', '0'); // Permite navegação por teclado
      });
      
      // Observer para alertas e toasts
      document.querySelectorAll('[role="alert"], .toast, .alert').forEach(element => {
        const observer = new MutationObserver(() => {
          if (element.textContent) {
            readText(`Alerta: ${element.textContent}`);
          }
        });
        observer.observe(element, { childList: true, subtree: true });
      });
    };
    
    // Aplica listeners imediatamente
    addListeners();
    
    // Observer para novos elementos adicionados ao DOM
    const observer = new MutationObserver(() => {
      setTimeout(addListeners, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Anuncia ativação do leitor de tela
    readText('Leitor de tela ativado. Clique em qualquer texto ou título para ouvir o conteúdo.');
  }
};

/**
 * Desativa o leitor de tela
 * Cancela qualquer leitura em andamento
 */
const deactivateScreenReader = () => {
  isScreenReaderActive = false;
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
  
  // Remove listeners (simplificado - em produção seria mais específico)
  document.querySelectorAll('button, a, input, select, textarea, h1, h2, h3, h4, h5, h6').forEach(element => {
    element.removeEventListener('focus', () => {});
    element.removeEventListener('mouseenter', () => {});
  });
};

/**
 * Componente AccessibilityPanel
 * 
 * Renderiza botão flutuante e painel lateral com opções de acessibilidade
 */
const AccessibilityPanel = () => {
  // Estado de abertura do painel
  const [isOpen, setIsOpen] = useState(false);
  
  // Hook customizado que gerencia configurações de acessibilidade
  const { settings, updateSetting } = useAccessibility();

  return (
    <>
      {/* Botão Flutuante de Acessibilidade */}
      <div className="fixed bottom-6 left-6 z-40">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Abrir painel de acessibilidade"
            >
              <Accessibility className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          
          {/* Painel Lateral */}
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Accessibility className="w-5 h-5" />
                Acessibilidade
              </SheetTitle>
              <div className="text-sm text-muted-foreground">
                Configure as opções de acessibilidade para melhorar sua experiência
              </div>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              
              {/* ================================================================
                  TAMANHO DA FONTE
                  ================================================================ */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <Label className="font-medium">Tamanho da Fonte</Label>
                </div>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value: 'normal' | 'large' | 'xl') => updateSetting('fontSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                    <SelectItem value="xl">Muito Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ================================================================
                  ALTO CONTRASTE
                  ================================================================ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Contrast className="w-4 h-4" />
                  <Label htmlFor="high-contrast">Alto Contraste</Label>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>

              {/* ================================================================
                  REDUZIR ANIMAÇÕES
                  ================================================================ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <Label htmlFor="reduced-motion">Reduzir Animações</Label>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                />
              </div>

              {/* ================================================================
                  LEITOR DE TELA
                  ================================================================ */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <Label htmlFor="screen-reader">Leitor de Tela</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ativa narração dos elementos da página
                  </p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => {
                    updateSetting('screenReader', checked);
                    if (checked) {
                      activateScreenReader();
                    } else {
                      deactivateScreenReader();
                    }
                  }}
                />
              </div>

              {/* ================================================================
                  TEXTO DE AJUDA
                  ================================================================ */}
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Sobre Acessibilidade</h4>
                <p className="text-xs text-muted-foreground">
                  Estas configurações ajudam a tornar o aplicativo mais acessível para pessoas com diferentes necessidades. 
                  Use os atalhos de teclado Tab (navegação) e Enter (ativação) para navegar pelo app.
                </p>
              </div>

              {/* ================================================================
                  BOTÃO RESTAURAR PADRÃO
                  ================================================================ */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Restaura todas as configurações para o padrão
                  updateSetting('fontSize', 'normal');
                  updateSetting('highContrast', false);
                  updateSetting('reducedMotion', false);
                  updateSetting('screenReader', false);
                  deactivateScreenReader();
                }}
              >
                Restaurar Configurações Padrão
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default AccessibilityPanel;
