import { useState } from "react";
import { Accessibility, Type, Contrast, Zap, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAccessibility } from "@/hooks/useAccessibility";

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
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <Label htmlFor="screen-reader">Leitor de Tela</Label>
                </div>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => updateSetting('screenReader', checked)}
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