import { useState } from "react";
import { Accessibility, Type, Contrast, Zap, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAccessibility } from "@/hooks/useAccessibility";

// Variável global para controlar o leitor de tela
let speechSynthesis: SpeechSynthesis;
let isScreenReaderActive = false;

const activateScreenReader = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis;
    isScreenReaderActive = true;
    
    // Função para ler texto
    const readText = (text: string) => {
      if (isScreenReaderActive && text) {
        speechSynthesis.cancel(); // Cancela qualquer leitura anterior
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }
    };
    
    // Adicionar listeners para elementos interativos
    const addListeners = () => {
      // Ler botões ao focar
      document.querySelectorAll('button, a, input, select, textarea').forEach(element => {
        element.addEventListener('focus', () => {
          const text = element.getAttribute('aria-label') || 
                      element.textContent || 
                      element.getAttribute('placeholder') || 
                      'Elemento interativo';
          readText(text);
        });
      });
      
      // Ler headings ao passar o mouse
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(element => {
        element.addEventListener('mouseenter', () => {
          readText(`Título: ${element.textContent}`);
        });
      });
      
      // Ler texto importante
      document.querySelectorAll('[role="alert"], .toast, .alert').forEach(element => {
        const observer = new MutationObserver(() => {
          if (element.textContent) {
            readText(`Alerta: ${element.textContent}`);
          }
        });
        observer.observe(element, { childList: true, subtree: true });
      });
    };
    
    // Aplicar listeners imediatamente e após mudanças no DOM
    addListeners();
    
    // Observer para novos elementos
    const observer = new MutationObserver(() => {
      setTimeout(addListeners, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Anunciar ativação
    readText('Leitor de tela ativado. Navegue pela página para ouvir o conteúdo.');
  }
};

const deactivateScreenReader = () => {
  isScreenReaderActive = false;
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
  
  // Remover todos os listeners (isso é simplificado, em produção seria mais específico)
  document.querySelectorAll('button, a, input, select, textarea, h1, h2, h3, h4, h5, h6').forEach(element => {
    element.removeEventListener('focus', () => {});
    element.removeEventListener('mouseenter', () => {});
  });
};

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting } = useAccessibility();

  return (
    <>
      {/* Floating Accessibility Button */}
      <div className="fixed bottom-6 right-6 z-50">
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
              {/* Font Size */}
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

              {/* High Contrast */}
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

              {/* Reduced Motion */}
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

              {/* Screen Reader Support */}
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
                      // Ativar funcionalidade de leitor de tela
                      activateScreenReader();
                    } else {
                      // Desativar funcionalidade de leitor de tela
                      deactivateScreenReader();
                    }
                  }}
                />
              </div>

              {/* Help Text */}
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Sobre Acessibilidade</h4>
                <p className="text-xs text-muted-foreground">
                  Estas configurações ajudam a tornar o aplicativo mais acessível para pessoas com diferentes necessidades. 
                  Use os atalhos de teclado Tab (navegação) e Enter (ativação) para navegar pelo app.
                </p>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
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