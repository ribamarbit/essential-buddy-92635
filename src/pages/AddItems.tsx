/**
 * =============================================================================
 * ADDITEMS.TSX - Página de Cadastro de Itens Essenciais
 * =============================================================================
 * 
 * Esta página permite ao usuário cadastrar itens que ele consome regularmente.
 * Os itens cadastrados aqui aparecem no Dashboard como "Itens Essenciais".
 * 
 * Funcionalidades:
 * - Seleção rápida de itens predefinidos (café, leite, arroz, etc.)
 * - Cadastro de itens personalizados
 * - Scanner de texto para extrair itens de notas fiscais
 * - Upload de imagens e captura via câmera
 * 
 * Fluxo de dados:
 * Items adicionados aqui → Salvos no localStorage → Aparecem no Dashboard
 * 
 * =============================================================================
 */

// Importações do React
import { useState } from "react";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Hooks
import { useToast } from "@/hooks/use-toast";

// Ícones
import { Scan } from "lucide-react";

/**
 * Lista de itens predefinidos para seleção rápida
 * Cada item contém:
 * - name: Nome do produto
 * - icon: Emoji representativo
 * - defaultDays: Duração média em dias
 */
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

/**
 * Componente principal da página de cadastro de itens
 */
const AddItems = () => {
  // Hook para exibir notificações toast
  const { toast } = useToast();
  
  // Estado para item personalizado sendo criado
  const [customItem, setCustomItem] = useState({ name: "", icon: "", days: "" });
  
  // Lista de itens selecionados para salvar
  const [selectedItems, setSelectedItems] = useState<typeof predefinedItems>([]);
  
  // Estado de processamento do scanner
  const [isScanning, setIsScanning] = useState(false);
  
  // Texto inserido para processamento no scanner
  const [scanText, setScanText] = useState("");
  

  /**
   * Adiciona um item predefinido à lista de selecionados
   * Verifica se o item já está na lista antes de adicionar
   * 
   * @param item - Item predefinido a ser adicionado
   */
  const handleQuickAdd = (item: typeof predefinedItems[0]) => {
    // Verifica se já foi selecionado
    if (selectedItems.some(i => i.name === item.name)) {
      toast({
        title: "Item já selecionado",
        description: `${item.name} já está na sua lista.`
      });
      return;
    }
    
    // Adiciona à lista de selecionados
    setSelectedItems(prev => [...prev, item]);
    toast({
      title: "Item adicionado! ✅",
      description: `${item.name} foi adicionado aos seus essenciais.`
    });
  };

  /**
   * Adiciona um item personalizado à lista de selecionados
   * Valida se nome e dias foram preenchidos
   */
  const handleCustomAdd = () => {
    // Validação de campos obrigatórios
    if (!customItem.name || !customItem.days) {
      toast({
        title: "Preencha os campos",
        description: "Nome e dias são obrigatórios."
      });
      return;
    }

    // Cria o objeto do novo item
    const newItem = {
      name: customItem.name,
      icon: customItem.icon || "📦", // Emoji padrão se não informado
      defaultDays: parseInt(customItem.days)
    };

    // Adiciona e limpa o formulário
    setSelectedItems(prev => [...prev, newItem]);
    setCustomItem({ name: "", icon: "", days: "" });
    
    toast({
      title: "Item customizado adicionado! ✅",
      description: `${newItem.name} foi adicionado aos seus essenciais.`
    });
  };

  /**
   * Remove um item da lista de selecionados
   * 
   * @param itemName - Nome do item a ser removido
   */
  const handleRemoveSelected = (itemName: string) => {
    setSelectedItems(prev => prev.filter(i => i.name !== itemName));
    toast({
      title: "Item removido",
      description: "Item foi removido da sua lista."
    });
  };

  /**
   * Extrai itens de um texto (nota fiscal ou lista de compras)
   * Usa um dicionário de palavras-chave para identificar produtos
   * Também extrai quantidades e preços quando disponíveis
   * 
   * @param text - Texto a ser processado
   * @returns Array de itens detectados
   */
  const extractItemsFromText = (text: string) => {
    // Separa o texto em linhas e remove vazias
    const lines = text.split('\n').filter(line => line.trim());
    const detectedItems: Array<{ name: string; icon: string; defaultDays: number; quantity?: string; price?: string }> = [];
    
    /**
     * Dicionário de palavras-chave para detectar produtos
     * Inclui variações ortográficas e abreviações comuns
     * Mapeia para: nome padronizado, emoji e duração em dias
     */
    const keywords: { [key: string]: { name: string; icon: string; days: number } } = {
      // Bebidas
      'café': { name: 'Café', icon: '☕', days: 15 },
      'cafe': { name: 'Café', icon: '☕', days: 15 },
      'leite': { name: 'Leite', icon: '🥛', days: 7 },
      'lt': { name: 'Leite', icon: '🥛', days: 7 },
      'suco': { name: 'Suco', icon: '🧃', days: 7 },
      
      // Grãos e cereais
      'arroz': { name: 'Arroz', icon: '🍚', days: 30 },
      'feijão': { name: 'Feijão', icon: '🫘', days: 45 },
      'feijao': { name: 'Feijão', icon: '🫘', days: 45 },
      'feij': { name: 'Feijão', icon: '🫘', days: 45 },
      'macarrão': { name: 'Macarrão', icon: '🍝', days: 60 },
      'macarrao': { name: 'Macarrão', icon: '🍝', days: 60 },
      'massa': { name: 'Macarrão', icon: '🍝', days: 60 },
      
      // Açúcar e temperos
      'açúcar': { name: 'Açúcar', icon: '🍯', days: 45 },
      'acucar': { name: 'Açúcar', icon: '🍯', days: 45 },
      'sal': { name: 'Sal', icon: '🧂', days: 180 },
      
      // Óleos e gorduras
      'óleo': { name: 'Óleo', icon: '🫒', days: 60 },
      'oleo': { name: 'Óleo', icon: '🫒', days: 60 },
      'manteiga': { name: 'Manteiga', icon: '🧈', days: 14 },
      'mant': { name: 'Manteiga', icon: '🧈', days: 14 },
      
      // Limpeza
      'sabão': { name: 'Sabão', icon: '🧼', days: 20 },
      'sabao': { name: 'Sabão', icon: '🧼', days: 20 },
      'detergente': { name: 'Detergente', icon: '🧽', days: 30 },
      'amaciante': { name: 'Amaciante', icon: '🧴', days: 30 },
      'esponja': { name: 'Esponja', icon: '🧽', days: 15 },
      
      // Pet
      'ração': { name: 'Ração Pet', icon: '🐶', days: 25 },
      'racao': { name: 'Ração Pet', icon: '🐶', days: 25 },
      
      // Padaria
      'pão': { name: 'Pão', icon: '🍞', days: 3 },
      'pao': { name: 'Pão', icon: '🍞', days: 3 },
      
      // Proteínas
      'ovos': { name: 'Ovos', icon: '🥚', days: 14 },
      'ovo': { name: 'Ovos', icon: '🥚', days: 14 },
      'frango': { name: 'Frango', icon: '🐔', days: 5 },
      'carne': { name: 'Carne', icon: '🥩', days: 5 },
      'peixe': { name: 'Peixe', icon: '🐟', days: 3 },
      
      // Farináceos
      'farinha': { name: 'Farinha', icon: '🌾', days: 90 },
      'far': { name: 'Farinha', icon: '🌾', days: 90 },
      
      // Laticínios
      'queijo': { name: 'Queijo', icon: '🧀', days: 15 },
      'iogurte': { name: 'Iogurte', icon: '🥛', days: 7 },
      
      // Higiene
      'sabonete': { name: 'Sabonete', icon: '🧼', days: 30 },
      'shampoo': { name: 'Shampoo', icon: '🧴', days: 45 },
      'condicionador': { name: 'Condicionador', icon: '🧴', days: 45 },
      'pasta': { name: 'Pasta de dente', icon: '🦷', days: 30 },
      'dente': { name: 'Pasta de dente', icon: '🦷', days: 30 },
      'desodorante': { name: 'Desodorante', icon: '🧴', days: 30 },
      'desod': { name: 'Desodorante', icon: '🧴', days: 30 },
      
      // Frutas e verduras
      'cenoura': { name: 'Cenoura', icon: '🥕', days: 7 },
      'tomate': { name: 'Tomate', icon: '🍅', days: 5 },
      'laranja': { name: 'Laranja', icon: '🍊', days: 7 },
      'manga': { name: 'Manga', icon: '🥭', days: 5 },
      'banana': { name: 'Banana', icon: '🍌', days: 5 },
      
      // Snacks
      'biscoito': { name: 'Biscoito', icon: '🍪', days: 30 },
      'bisc': { name: 'Biscoito', icon: '🍪', days: 30 },
      
      // Cereais
      'flocos': { name: 'Flocos de Milho', icon: '🌽', days: 45 },
      'flokao': { name: 'Flocos de Milho', icon: '🌽', days: 45 }
    };

    // Expressão regular para extrair preço (ex: R$ 4,50 ou 4.50)
    const priceRegex = /r?\$?\s*(\d+[.,]\d{2})/i;
    
    // Expressão regular para extrair quantidade e unidade
    const quantityRegex = /(\d+[.,]?\d*)\s*(kg|g|l|ml|un|unidade|und|pc)/i;

    // Processa cada linha do texto
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Extrai preço se existir
      const priceMatch = line.match(priceRegex);
      const price = priceMatch ? priceMatch[1].replace(',', '.') : undefined;
      
      // Extrai quantidade se existir
      const quantityMatch = line.match(quantityRegex);
      const quantity = quantityMatch ? `${quantityMatch[1]} ${quantityMatch[2]}` : undefined;
      
      // Busca palavras-chave do dicionário
      Object.entries(keywords).forEach(([key, item]) => {
        // Verifica se a linha contém a palavra-chave e se não é duplicado
        if (lowerLine.includes(key) && !detectedItems.some(i => i.name === item.name)) {
          detectedItems.push({ 
            name: item.name, 
            icon: item.icon, 
            defaultDays: item.days,
            quantity,
            price
          });
        }
      });
    });

    return detectedItems;
  };

  /**
   * Processa texto colado manualmente
   * Extrai itens usando o dicionário de palavras-chave
   */
  const handleTextProcess = () => {
    if (!scanText.trim()) {
      toast({
        title: "Texto vazio",
        description: "Cole o texto da sua lista de compras ou nota fiscal.",
        variant: "destructive"
      });
      return;
    }

    // Extrai itens do texto
    const detectedItems = extractItemsFromText(scanText);
    
    if (detectedItems.length > 0) {
      // Filtra duplicados
      const newItems = detectedItems.filter(
        item => !selectedItems.some(selected => selected.name === item.name)
      );
      
      // Adiciona à lista e limpa o campo
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

  /**
   * Salva os itens selecionados no localStorage
   * Os itens salvos aparecem no Dashboard como "Itens Essenciais"
   */
  const handleSaveItems = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Selecione pelo menos um item para salvar."
      });
      return;
    }

    // Carrega itens existentes do localStorage
    const existingData = localStorage.getItem('dashboardEssentials');
    const currentItems = existingData ? JSON.parse(existingData) : [];
    
    // Cria objetos de itens com metadados
    const newItems = selectedItems.map(item => ({
      id: Date.now().toString() + Math.random(),
      name: item.name,
      icon: item.icon,
      startDate: Date.now(), // Data de início para cálculo de consumo
      totalDays: item.defaultDays,
      estimatedPrice: 5.0 // Preço padrão
    }));
    
    // Evita duplicatas verificando por nome
    const uniqueItems = [...currentItems];
    newItems.forEach(newItem => {
      if (!uniqueItems.some(existing => existing.name === newItem.name)) {
        uniqueItems.push(newItem);
      }
    });
    
    // Salva no localStorage
    localStorage.setItem('dashboardEssentials', JSON.stringify(uniqueItems));
    
    toast({
      title: "Itens salvos no Dashboard! 🎉",
      description: `${selectedItems.length} ${selectedItems.length === 1 ? 'item foi adicionado' : 'itens foram adicionados'} aos itens essenciais.`
    });
    
    // Limpa a seleção
    setSelectedItems([]);
  };

  // ==========================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ==========================================================================
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* ================================================================
            CABEÇALHO DA PÁGINA
            ================================================================ */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Cadastre seus Itens Essenciais
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Selecione os itens que você consome regularmente para receber alertas inteligentes.
          </p>
        </div>

        {/* ================================================================
            ABAS: CATÁLOGO E SCANNER
            ================================================================ */}
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="catalog">Catálogo</TabsTrigger>
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
          </TabsList>

          {/* ==============================================================
              ABA: CATÁLOGO
              Seleção rápida + Item personalizado
              ============================================================== */}
          <TabsContent value="catalog" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Card de Seleção Rápida */}
              <Card>
                <CardHeader>
                  <CardTitle>Seleção Rápida</CardTitle>
                  <CardDescription>
                    Clique nos itens mais comuns para adicionar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Grid de botões de itens predefinidos */}
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

              {/* Card de Item Personalizado */}
              <Card>
                <CardHeader>
                  <CardTitle>Item Personalizado</CardTitle>
                  <CardDescription>
                    Adicione um item que não está na lista
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Campo: Nome do Item */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Item</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Vitamina, Remédio..."
                      value={customItem.name}
                      onChange={(e) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  {/* Campo: Emoji (opcional) */}
                  <div className="space-y-2">
                    <Label htmlFor="icon">Emoji (opcional)</Label>
                    <Input
                      id="icon"
                      placeholder="Ex: 💊, 🧴..."
                      value={customItem.icon}
                      onChange={(e) => setCustomItem(prev => ({ ...prev, icon: e.target.value }))}
                    />
                  </div>
                  
                  {/* Campo: Duração em dias */}
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
                  
                  {/* Botão de adicionar */}
                  <Button onClick={handleCustomAdd} className="w-full">
                    Adicionar Item Personalizado
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* ==============================================================
              ABA: SCANNER
              Processamento de texto de listas de compras
              ============================================================== */}
          <TabsContent value="scanner" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-primary" />
                  <CardTitle>Importar Lista de Compras</CardTitle>
                </div>
                <CardDescription>
                  Cole o texto da sua lista de compras ou nota fiscal para extrair produtos automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Campo de texto para colar nota fiscal */}
                <div className="space-y-2">
                  <Label htmlFor="scan-text">Texto da Lista/Nota Fiscal</Label>
                  <Textarea
                    id="scan-text"
                    placeholder={`Cole aqui o texto da sua lista de compras ou nota fiscal...

Exemplo:
Arroz 5 kg R$ 4,50
Leite 1L R$ 3.80
Feijão 1 kg R$ 6,20
Café 500g R$ 12,90`}
                    value={scanText}
                    onChange={(e) => setScanText(e.target.value)}
                    rows={10}
                    className="resize-none font-mono text-sm"
                  />
                </div>

                {/* Botão de processar texto */}
                <Button 
                  onClick={handleTextProcess}
                  disabled={isScanning || !scanText.trim()}
                  className="w-full"
                  size="lg"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  {isScanning ? 'Processando...' : 'Processar e Adicionar Itens'}
                </Button>

                {/* Card de dicas */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Dicas de uso:</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Cole cada produto em uma linha separada</li>
                        <li>O sistema reconhece nomes de produtos em português</li>
                        <li>Quantidades e preços são extraídos automaticamente</li>
                        <li>Formatos aceitos: "Produto 5kg R$4,50" ou "Produto 1L 3.80"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ================================================================
            RESUMO DOS ITENS SELECIONADOS
            Mostra itens selecionados com opção de remover e salvar
            ================================================================ */}
        {selectedItems.length > 0 && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Itens Selecionados ({selectedItems.length})</CardTitle>
              <CardDescription>
                Estes itens serão adicionados ao Dashboard como itens essenciais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de chips com itens selecionados */}
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg"
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">({item.defaultDays}d)</span>
                    {/* Botão de remover item */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-1"
                      onClick={() => handleRemoveSelected(item.name)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Botão de salvar no Dashboard */}
              <Button onClick={handleSaveItems} className="w-full" size="lg">
                Salvar no Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
};

export default AddItems;
