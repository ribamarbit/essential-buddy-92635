import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload } from "lucide-react";

const predefinedItems = [
  { name: "Café", icon: "☕", defaultDays: 15 },
  { name: "Leite", icon: "🥛", defaultDays: 7 },
  { name: "Arroz", icon: "🍚", defaultDays: 30 },
  { name: "Feijão", icon: "🫘", defaultDays: 45 },
  { name: "Açúcar", icon: "🍯", defaultDays: 45 },
  { name: "Óleo", icon: "🫒", defaultDays: 60 },
  { name: "Sabão", icon: "🧼", defaultDays: 20 },
  { name: "Detergente", icon: "🧽", defaultDays: 30 },
  { name: "Ração Pet", icon: "🐶", defaultDays: 25 },
  { name: "Pão", icon: "🍞", defaultDays: 3 },
  { name: "Ovos", icon: "🥚", defaultDays: 14 },
  { name: "Frango", icon: "🐔", defaultDays: 5 },
];

const AddItems = () => {
  const { toast } = useToast();
  const [customItem, setCustomItem] = useState({ name: "", icon: "", days: "" });
  const [selectedItems, setSelectedItems] = useState<typeof predefinedItems>([]);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQuickAdd = (item: typeof predefinedItems[0]) => {
    if (selectedItems.some(i => i.name === item.name)) {
      toast({
        title: "Item já selecionado",
        description: `${item.name} já está na sua lista.`
      });
      return;
    }
    
    setSelectedItems(prev => [...prev, item]);
    toast({
      title: "Item adicionado! ✅",
      description: `${item.name} foi adicionado aos seus essenciais.`
    });
  };

  const handleCustomAdd = () => {
    if (!customItem.name || !customItem.days) {
      toast({
        title: "Preencha os campos",
        description: "Nome e dias são obrigatórios."
      });
      return;
    }

    const newItem = {
      name: customItem.name,
      icon: customItem.icon || "📦",
      defaultDays: parseInt(customItem.days)
    };

    setSelectedItems(prev => [...prev, newItem]);
    setCustomItem({ name: "", icon: "", days: "" });
    
    toast({
      title: "Item customizado adicionado! ✅",
      description: `${newItem.name} foi adicionado aos seus essenciais.`
    });
  };

  const handleRemoveSelected = (itemName: string) => {
    setSelectedItems(prev => prev.filter(i => i.name !== itemName));
    toast({
      title: "Item removido",
      description: "Item foi removido da sua lista."
    });
  };

  const extractItemsFromText = (text: string) => {
    const lines = text.toLowerCase().split('\n').filter(line => line.trim());
    const detectedItems: typeof predefinedItems = [];
    
    // Palavras-chave para detectar itens comuns
    const keywords: { [key: string]: { name: string; icon: string; days: number } } = {
      'café': { name: 'Café', icon: '☕', days: 15 },
      'cafe': { name: 'Café', icon: '☕', days: 15 },
      'leite': { name: 'Leite', icon: '🥛', days: 7 },
      'arroz': { name: 'Arroz', icon: '🍚', days: 30 },
      'feijão': { name: 'Feijão', icon: '🫘', days: 45 },
      'feijao': { name: 'Feijão', icon: '🫘', days: 45 },
      'açúcar': { name: 'Açúcar', icon: '🍯', days: 45 },
      'acucar': { name: 'Açúcar', icon: '🍯', days: 45 },
      'óleo': { name: 'Óleo', icon: '🫒', days: 60 },
      'oleo': { name: 'Óleo', icon: '🫒', days: 60 },
      'sabão': { name: 'Sabão', icon: '🧼', days: 20 },
      'sabao': { name: 'Sabão', icon: '🧼', days: 20 },
      'detergente': { name: 'Detergente', icon: '🧽', days: 30 },
      'ração': { name: 'Ração Pet', icon: '🐶', days: 25 },
      'racao': { name: 'Ração Pet', icon: '🐶', days: 25 },
      'pão': { name: 'Pão', icon: '🍞', days: 3 },
      'pao': { name: 'Pão', icon: '🍞', days: 3 },
      'ovos': { name: 'Ovos', icon: '🥚', days: 14 },
      'ovo': { name: 'Ovos', icon: '🥚', days: 14 },
      'frango': { name: 'Frango', icon: '🐔', days: 5 },
      'macarrão': { name: 'Macarrão', icon: '🍝', days: 60 },
      'macarrao': { name: 'Macarrão', icon: '🍝', days: 60 },
      'massa': { name: 'Macarrão', icon: '🍝', days: 60 },
      'carne': { name: 'Carne', icon: '🥩', days: 5 },
      'peixe': { name: 'Peixe', icon: '🐟', days: 3 },
      'farinha': { name: 'Farinha', icon: '🌾', days: 90 },
      'sal': { name: 'Sal', icon: '🧂', days: 180 },
      'manteiga': { name: 'Manteiga', icon: '🧈', days: 14 },
      'queijo': { name: 'Queijo', icon: '🧀', days: 15 },
      'iogurte': { name: 'Iogurte', icon: '🥛', days: 7 },
      'sabonete': { name: 'Sabonete', icon: '🧼', days: 30 },
      'shampoo': { name: 'Shampoo', icon: '🧴', days: 45 },
      'condicionador': { name: 'Condicionador', icon: '🧴', days: 45 },
      'pasta': { name: 'Pasta de dente', icon: '🦷', days: 30 },
      'dente': { name: 'Pasta de dente', icon: '🦷', days: 30 }
    };

    lines.forEach(line => {
      Object.entries(keywords).forEach(([key, item]) => {
        if (line.includes(key) && !detectedItems.some(i => i.name === item.name)) {
          detectedItems.push({ name: item.name, icon: item.icon, defaultDays: item.days });
        }
      });
    });

    return detectedItems;
  };

  const handleCameraCapture = async () => {
    try {
      // Solicita permissão para câmera
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (permission.state === 'denied') {
        toast({
          title: "Permissão negada",
          description: "Por favor, permita o acesso à câmera nas configurações do navegador.",
          variant: "destructive"
        });
        return;
      }

      // Testa acesso à câmera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Para o stream após verificar permissão
      
      // Abre o input de arquivo com câmera
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.setAttribute('accept', 'image/*');
        fileInputRef.current.click();
      }
    } catch (error) {
      toast({
        title: "Acesso à câmera negado",
        description: "É necessário permitir o acesso à câmera para usar esta função.",
        variant: "destructive"
      });
    }
  };

  const handleGalleryUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.setAttribute('accept', 'image/*');
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    
    try {
      // Simular processamento de imagem (OCR)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Texto de exemplo - em produção, isso viria de um serviço de OCR
      const mockText = `
        Lista de compras:
        - Café
        - Leite
        - Arroz
        - Feijão
        - Óleo
        - Pão
      `;
      
      const detectedItems = extractItemsFromText(mockText);
      
      if (detectedItems.length > 0) {
        // Adicionar apenas itens que ainda não estão selecionados
        const newItems = detectedItems.filter(
          item => !selectedItems.some(selected => selected.name === item.name)
        );
        
        setSelectedItems(prev => [...prev, ...newItems]);
        
        toast({
          title: "✅ Itens detectados!",
          description: `${newItems.length} ${newItems.length === 1 ? 'item foi adicionado' : 'itens foram adicionados'} da sua lista.`
        });
      } else {
        toast({
          title: "Nenhum item detectado",
          description: "Tente uma imagem mais clara ou adicione os itens manualmente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao processar imagem",
        description: "Não foi possível ler a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualListInput = () => {
    const listText = prompt('Cole ou digite sua lista de compras (um item por linha):');
    if (!listText) return;

    const detectedItems = extractItemsFromText(listText);
    
    if (detectedItems.length > 0) {
      const newItems = detectedItems.filter(
        item => !selectedItems.some(selected => selected.name === item.name)
      );
      
      setSelectedItems(prev => [...prev, ...newItems]);
      
      toast({
        title: "✅ Itens adicionados!",
        description: `${newItems.length} ${newItems.length === 1 ? 'item foi adicionado' : 'itens foram adicionados'} da sua lista.`
      });
    } else {
      toast({
        title: "Nenhum item reconhecido",
        description: "Não conseguimos identificar itens na sua lista. Tente adicionar manualmente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Cadastre seus Itens Essenciais
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Selecione os itens que você consome regularmente para receber alertas inteligentes.
          </p>
        </div>

        {/* Scanner de Lista */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scanner Inteligente de Lista 📸</CardTitle>
            <CardDescription>
              Tire uma foto da sua lista ou cole o texto para adicionar itens automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={handleCameraCapture}
                disabled={isScanning}
              >
                <Camera className="w-6 h-6" />
                <span>{isScanning ? 'Processando...' : 'Câmera'}</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={handleGalleryUpload}
                disabled={isScanning}
              >
                <Upload className="w-6 h-6" />
                <span>Galeria</span>
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleManualListInput}
              disabled={isScanning}
            >
              <Upload className="w-4 h-4 mr-2" />
              Colar Lista de Texto
            </Button>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-800">
                💡 <strong>Dica:</strong> O scanner reconhece itens comuns como café, leite, arroz, feijão, óleo, pão, ovos, frango, macarrão, carne, peixe e muito mais!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick selection */}
          <Card>
            <CardHeader>
              <CardTitle>Seleção Rápida</CardTitle>
              <CardDescription>
                Clique nos itens mais comuns para adicionar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {predefinedItems.map((item) => (
                  <Button
                    key={item.name}
                    variant={selectedItems.some(i => i.name === item.name) ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => handleQuickAdd(item)}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.defaultDays} dias
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom item */}
          <Card>
            <CardHeader>
              <CardTitle>Item Personalizado</CardTitle>
              <CardDescription>
                Adicione um item que não está na lista
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Item</Label>
                <Input
                  id="name"
                  placeholder="Ex: Vitamina, Remédio..."
                  value={customItem.name}
                  onChange={(e) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Emoji (opcional)</Label>
                <Input
                  id="icon"
                  placeholder="Ex: 💊, 🧴..."
                  value={customItem.icon}
                  onChange={(e) => setCustomItem(prev => ({ ...prev, icon: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="days">Duração média (dias)</Label>
                <Input
                  id="days"
                  type="number"
                  placeholder="Ex: 30"
                  value={customItem.days}
                  onChange={(e) => setCustomItem(prev => ({ ...prev, days: e.target.value }))}
                />
              </div>
              
              <Button onClick={handleCustomAdd} className="w-full">
                Adicionar Item Personalizado
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Selected items */}
        {selectedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Seus Itens Selecionados ({selectedItems.length})</CardTitle>
              <CardDescription>
                Estes são os itens que você vai monitorar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.name}
                    className="relative group p-3 border rounded-lg text-center hover:bg-muted/50 transition-colors"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveSelected(item.name)}
                    >
                      ×
                    </Button>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.defaultDays}d
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AddItems;