import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Scan, Trash2, Edit3, Camera, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  icon?: string;
}

const ProductCatalog = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "Arroz", category: "Grãos", price: 4.50, quantity: 5, unit: "kg", icon: "🍚" },
    { id: "2", name: "Feijão", category: "Grãos", price: 6.20, quantity: 2, unit: "kg", icon: "🫘" },
    { id: "3", name: "Leite", category: "Laticínios", price: 3.80, quantity: 1, unit: "L", icon: "🥛" },
  ]);
  
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", price: "", quantity: "", unit: "un", icon: ""
  });
  
  const [scanText, setScanText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = ["Grãos", "Laticínios", "Carnes", "Verduras", "Frutas", "Limpeza", "Higiene", "Bebidas", "Outros"];
  const units = ["un", "kg", "g", "L", "ml", "pacote", "caixa"];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, preço e quantidade são obrigatórios.",
      });
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category || "Outros",
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity),
      unit: newProduct.unit,
      icon: newProduct.icon || "📦"
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({ name: "", category: "", price: "", quantity: "", unit: "un", icon: "" });
    
    toast({
      title: "Produto adicionado! ✅",
      description: `${product.name} foi cadastrado com sucesso.`
    });
  };

  const handleRemoveProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    
    toast({
      title: "Produto removido",
      description: `${product?.name} foi removido do catálogo.`
    });
  };

  const handleScanProcess = () => {
    if (!scanText.trim()) {
      toast({
        title: "Texto vazio",
        description: "Cole o texto da nota fiscal ou lista de compras para processar."
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulação de processamento de OCR/NLP
    setTimeout(() => {
      const lines = scanText.split('\n').filter(line => line.trim());
      const extractedProducts: Product[] = [];
      
      lines.forEach(line => {
        // Regex simples para extrair produto, quantidade e preço
        const match = line.match(/(.+?)\s+(\d+(?:\.\d+)?)\s*(\w+)?\s+R?\$?\s*(\d+[.,]\d{2})/i);
        if (match) {
          const [, name, qty, unit, price] = match;
          extractedProducts.push({
            id: Date.now().toString() + Math.random(),
            name: name.trim(),
            category: "Outros",
            price: parseFloat(price.replace(',', '.')),
            quantity: parseFloat(qty),
            unit: unit || "un",
            icon: "📦"
          });
        }
      });

      if (extractedProducts.length > 0) {
        setProducts(prev => [...prev, ...extractedProducts]);
        setScanText("");
        toast({
          title: `${extractedProducts.length} produtos extraídos! ✅`,
          description: "Produtos foram adicionados automaticamente ao catálogo."
        });
      } else {
        toast({
          title: "Nenhum produto encontrado",
          description: "Não foi possível extrair produtos do texto. Tente um formato diferente."
        });
      }
      
      setIsProcessing(false);
    }, 2000);
  };

  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Catálogo de Produtos
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gerencie seus produtos, quantidades e preços. Use o scanner para importar listas automaticamente.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="text-2xl">📦</div>
                <div>
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Produtos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="text-2xl">📊</div>
                <div>
                  <p className="text-2xl font-bold">{products.reduce((sum, p) => sum + p.quantity, 0)}</p>
                  <p className="text-sm text-muted-foreground">Quantidade Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="text-2xl">💰</div>
                <div>
                  <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="catalog">Catálogo</TabsTrigger>
            <TabsTrigger value="add">Adicionar</TabsTrigger>
            <TabsTrigger value="scan">Scanner</TabsTrigger>
          </TabsList>
          
          {/* Catalog Tab */}
          <TabsContent value="catalog" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Cadastrados</CardTitle>
                <CardDescription>
                  Lista completa dos seus produtos com preços e quantidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-muted-foreground">Nenhum produto cadastrado ainda</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{product.icon}</div>
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Badge variant="secondary">{product.category}</Badge>
                              <span>•</span>
                              <span>{product.quantity} {product.unit}</span>
                              <span>•</span>
                              <span className="font-medium text-green-600">R$ {product.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Add Tab */}
          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Produto</CardTitle>
                <CardDescription>
                  Cadastre um novo produto manualmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Arroz integral"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="1"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))}
                        className="flex-1"
                      />
                      <select
                        className="w-20 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="icon">Emoji (opcional)</Label>
                    <Input
                      id="icon"
                      placeholder="Ex: 🍚, 🥛, 🍞..."
                      value={newProduct.icon}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, icon: e.target.value }))}
                    />
                  </div>
                </div>
                
                <Button onClick={handleAddProduct} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Scanner Tab */}
          <TabsContent value="scan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scanner de Lista/Nota Fiscal</CardTitle>
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
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Exemplo de formato: "Arroz 5 kg R$ 4,50" ou "Leite 1L R$3.80"
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleScanProcess} 
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    {isProcessing ? "Processando..." : "Processar Texto"}
                  </Button>
                  
                  <Button variant="outline" disabled>
                    <Camera className="w-4 h-4 mr-2" />
                    Câmera
                  </Button>
                  
                  <Button variant="outline" disabled>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-2">💡 Dica de uso:</p>
                  <ul className="space-y-1">
                    <li>• Certifique-se que cada produto esteja em uma linha separada</li>
                    <li>• Inclua o nome, quantidade e preço do produto</li>
                    <li>• Use formatos como: "Produto Quantidade Unidade Preço"</li>
                    <li>• As funções de câmera e upload serão implementadas em breve</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProductCatalog;