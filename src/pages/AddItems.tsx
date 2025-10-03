import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Scan } from "lucide-react";

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
  const [scanText, setScanText] = useState("");
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

  const handleTextProcess = () => {
    if (!scanText.trim()) {
      toast({
        title: "Texto vazio",
        description: "Cole o texto da sua lista de compras ou nota fiscal.",
        variant: "destructive"
      });
      return;
    }

    const detectedItems = extractItemsFromText(scanText);
    
    if (detectedItems.length > 0) {
      const newItems = detectedItems.filter(
        item => !selectedItems.some(selected => selected.name === item.name)
      );
      
      setSelectedItems(prev => [...prev, ...newItems]);
      setScanText("");
      
      toast({
        title: "✅ Itens processados!",
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

        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="catalog">Catálogo</TabsTrigger>
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
          </TabsList>

          {/* Catálogo Tab */}
          <TabsContent value="catalog" className="space-y-4">
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
          </TabsContent>


          {/* Scanner Tab */}
          <TabsContent value="scanner" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-primary" />
                  <CardTitle>Scanner de Lista/Nota Fiscal</CardTitle>
                </div>
                <CardDescription>
                  Cole o texto da sua lista de compras ou nota fiscal para extrair produtos automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scan-text">Texto da Lista/Nota Fiscal</Label>
                  <Textarea
                    id="scan-text"
                    placeholder="Cole aqui o texto da sua lista de compras ou nota fiscal..."
                    value={scanText}
                    onChange={(e) => setScanText(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Exemplo de formato: "Arroz 5 kg R$ 4,50" ou "Leite 1L R$3.80"
                  </p>
                </div>

                <Button 
                  onClick={handleTextProcess}
                  disabled={isScanning || !scanText.trim()}
                  className="w-full"
                  size="lg"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  {isScanning ? 'Processando...' : 'Processar Texto'}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCameraCapture}
                    disabled={isScanning}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Câmera
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleGalleryUpload}
                    disabled={isScanning}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Dica de uso:</p>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                        <li>Certifique-se que cada produto esteja em uma linha separada</li>
                        <li>Inclua o nome, quantidade e preço do produto</li>
                        <li>Use formatos como: "Produto Quantidade Unidade Preço"</li>
                        <li>As funções de câmera e upload serão implementadas em breve</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
};

export default AddItems;