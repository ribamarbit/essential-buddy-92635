/**
 * =============================================================================
 * PRODUCTCATALOG.TSX - Catálogo de Produtos
 * =============================================================================
 * 
 * Esta página gerencia o catálogo de produtos do usuário.
 * Diferente de "AddItems" (que vai pro Dashboard), produtos aqui vão para
 * a Lista de Compras quando o usuário clica em "Adicionar à Lista".
 * 
 * Funcionalidades:
 * - Visualizar produtos cadastrados
 * - Adicionar novos produtos manualmente
 * - Editar produtos existentes
 * - Remover produtos
 * - Adicionar produtos à Lista de Compras
 * - Estatísticas (total de produtos, quantidade, valor)
 * 
 * Fluxo de dados:
 * Produtos → localStorage (catalogProducts) → Lista de Compras (shoppingList)
 * 
 * =============================================================================
 */

// Importações do React
import { useState, useEffect } from "react";
import { useRef } from "react";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Hooks
import { useToast } from "@/hooks/use-toast";

// Ícones
import { Plus, Scan, Trash2, Edit3, Camera, Upload } from "lucide-react";

/**
 * Interface que define a estrutura de um produto
 */
interface Product {
  id: string;           // Identificador único
  name: string;         // Nome do produto
  category: string;     // Categoria (Grãos, Laticínios, etc.)
  price: number;        // Preço unitário
  quantity: number;     // Quantidade
  unit: string;         // Unidade de medida (un, kg, L, etc.)
  icon?: string;        // Emoji representativo (opcional)
}

/**
 * Componente principal do Catálogo de Produtos
 */
const ProductCatalog = () => {
  // Hook para notificações toast
  const { toast } = useToast();
  
  // Estado da lista de produtos
  const [products, setProducts] = useState<Product[]>([]);

  /**
   * Carrega produtos do localStorage na inicialização
   * Se não houver produtos salvos, cria dados padrão de exemplo
   */
  useEffect(() => {
    const storedProducts = localStorage.getItem('catalogProducts');
    if (storedProducts) {
      try {
        setProducts(JSON.parse(storedProducts));
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      }
    } else {
      // Produtos padrão para demonstração
      const defaultProducts = [
        { id: "1", name: "Arroz", category: "Grãos", price: 4.50, quantity: 5, unit: "kg", icon: "🍚" },
        { id: "2", name: "Feijão", category: "Grãos", price: 6.20, quantity: 2, unit: "kg", icon: "🫘" },
        { id: "3", name: "Leite", category: "Laticínios", price: 3.80, quantity: 1, unit: "L", icon: "🥛" },
      ];
      setProducts(defaultProducts);
      localStorage.setItem('catalogProducts', JSON.stringify(defaultProducts));
    }
  }, []);
  
  // Estado do formulário de novo produto
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", price: "", quantity: "", unit: "un", icon: ""
  });
  
  // Estado para edição de produto
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Estado do scanner (funcionalidade futura)
  const [scanText, setScanText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listas de categorias e unidades disponíveis
  const categories = ["Grãos", "Laticínios", "Carnes", "Verduras", "Frutas", "Limpeza", "Higiene", "Bebidas", "Outros"];
  const units = ["un", "kg", "g", "L", "ml", "pacote", "caixa"];

  /**
   * Adiciona um novo produto ao catálogo
   * Valida campos obrigatórios antes de salvar
   */
  const handleAddProduct = () => {
    // Validação de campos obrigatórios
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, preço e quantidade são obrigatórios.",
      });
      return;
    }

    // Cria o objeto do produto
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category || "Outros",
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity),
      unit: newProduct.unit,
      icon: newProduct.icon || "📦"
    };

    // Atualiza estado e localStorage
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    localStorage.setItem('catalogProducts', JSON.stringify(updatedProducts));
    
    // Limpa o formulário
    setNewProduct({ name: "", category: "", price: "", quantity: "", unit: "un", icon: "" });
    
    toast({
      title: "Produto adicionado! ✅",
      description: `${product.name} foi cadastrado com sucesso.`
    });
  };

  /**
   * Remove um produto do catálogo
   * 
   * @param id - ID do produto a ser removido
   */
  const handleRemoveProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('catalogProducts', JSON.stringify(updatedProducts));
    
    toast({
      title: "Produto removido",
      description: `${product?.name} foi removido do catálogo.`
    });
  };

  /**
   * Abre o modal de edição com os dados do produto
   * 
   * @param product - Produto a ser editado
   */
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  /**
   * Salva as alterações do produto editado
   */
  const handleSaveEditedProduct = () => {
    if (!editingProduct) return;
    
    // Atualiza o produto na lista
    const updatedProducts = products.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('catalogProducts', JSON.stringify(updatedProducts));
    
    // Fecha o modal
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    
    toast({
      title: "Produto atualizado! ✅",
      description: `${editingProduct.name} foi atualizado com sucesso.`
    });
  };

  /**
   * Adiciona um produto à Lista de Compras
   * Verifica se já existe na lista antes de adicionar
   * 
   * @param product - Produto a ser adicionado
   */
  const handleAddToShoppingList = (product: Product) => {
    // Cria item para a lista de compras
    const shoppingItem = {
      id: Date.now().toString(),
      name: product.name,
      icon: product.icon || "📦",
      priority: "medium" as const,
      estimatedPrice: product.price
    };

    // Carrega lista existente
    const existingList = localStorage.getItem('shoppingList');
    const currentList = existingList ? JSON.parse(existingList) : [];
    
    // Verifica se já existe na lista
    if (currentList.some((item: any) => item.name === product.name)) {
      toast({
        title: "Item já na lista",
        description: `${product.name} já está na sua Lista de Compras.`
      });
      return;
    }

    // Adiciona à lista e salva
    const updatedList = [...currentList, shoppingItem];
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
    
    toast({
      title: "Adicionado à Lista de Compras! 🛒",
      description: `${product.name} foi adicionado à sua Lista de Compras.`
    });
  };

  /**
   * Processa texto para extrair produtos (scanner)
   * Simula processamento OCR/NLP para notas fiscais
   */
  const handleScanProcess = () => {
    if (!scanText.trim()) {
      toast({
        title: "Texto vazio",
        description: "Cole o texto da nota fiscal ou lista de compras para processar."
      });
      return;
    }

    setIsProcessing(true);
    
    // Simula tempo de processamento
    setTimeout(() => {
      const lines = scanText.split('\n').filter(line => line.trim());
      const extractedProducts: Product[] = [];
      
      // Tenta extrair produtos de cada linha usando regex
      lines.forEach(line => {
        // Regex para formato: "Nome Quantidade Unidade Preço"
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
        // Adiciona produtos extraídos
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

  /**
   * Placeholder para funcionalidade de câmera
   * A ser implementada com integração de OCR
   */
  const handleCameraCapture = () => {
    toast({
      title: "Câmera em desenvolvimento",
      description: "Esta funcionalidade será implementada em breve para capturar imagens de notas fiscais."
    });
  };

  /**
   * Abre seletor de arquivos para upload
   */
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Processa arquivo selecionado
   * Placeholder para processamento de imagem
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Upload em desenvolvimento",
        description: `Arquivo ${file.name} será processado quando a funcionalidade estiver completa.`
      });
    }
  };

  // Calcula valor total do catálogo
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

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
            Catálogo de Produtos
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gerencie seus produtos, quantidades e preços. Use o scanner para importar listas automaticamente.
          </p>
        </div>

        {/* ================================================================
            CARDS DE ESTATÍSTICAS
            ================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total de produtos */}
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
          
          {/* Quantidade total */}
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
          
          {/* Valor total */}
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

        {/* ================================================================
            ABAS: CATÁLOGO E ADICIONAR
            ================================================================ */}
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="catalog">Catálogo</TabsTrigger>
            <TabsTrigger value="add">Adicionar</TabsTrigger>
          </TabsList>
          
          {/* ==============================================================
              ABA: CATÁLOGO
              Lista de produtos cadastrados
              ============================================================== */}
          <TabsContent value="catalog" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Cadastrados</CardTitle>
                <CardDescription>
                  Clique em "Adicionar à Lista" para enviar produtos para sua Lista de Compras
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Estado vazio */}
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-muted-foreground">Nenhum produto cadastrado ainda</p>
                  </div>
                ) : (
                  /* Lista de produtos */
                  <div className="grid gap-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {/* Informações do produto */}
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
                        
                        {/* Botões de ação */}
                        <div className="flex items-center space-x-2">
                          {/* Botão: Adicionar à Lista de Compras */}
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleAddToShoppingList(product)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar à Lista
                          </Button>
                          
                          {/* Modal de edição */}
                          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Produto</DialogTitle>
                                <DialogDescription>
                                  Atualize as informações do produto.
                                </DialogDescription>
                              </DialogHeader>
                              {/* Formulário de edição */}
                              {editingProduct && (
                                <div className="grid gap-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-name">Nome</Label>
                                      <Input
                                        id="edit-name"
                                        value={editingProduct.name}
                                        onChange={(e) => setEditingProduct(prev => 
                                          prev ? { ...prev, name: e.target.value } : null
                                        )}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-category">Categoria</Label>
                                      <select
                                        id="edit-category"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={editingProduct.category}
                                        onChange={(e) => setEditingProduct(prev => 
                                          prev ? { ...prev, category: e.target.value } : null
                                        )}
                                      >
                                        {categories.map(cat => (
                                          <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-price">Preço</Label>
                                      <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        value={editingProduct.price}
                                        onChange={(e) => setEditingProduct(prev => 
                                          prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null
                                        )}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-quantity">Quantidade</Label>
                                      <Input
                                        id="edit-quantity"
                                        type="number"
                                        value={editingProduct.quantity}
                                        onChange={(e) => setEditingProduct(prev => 
                                          prev ? { ...prev, quantity: parseInt(e.target.value) || 0 } : null
                                        )}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-unit">Unidade</Label>
                                      <select
                                        id="edit-unit"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={editingProduct.unit}
                                        onChange={(e) => setEditingProduct(prev => 
                                          prev ? { ...prev, unit: e.target.value } : null
                                        )}
                                      >
                                        {units.map(unit => (
                                          <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-icon">Emoji</Label>
                                    <Input
                                      id="edit-icon"
                                      value={editingProduct.icon}
                                      onChange={(e) => setEditingProduct(prev => 
                                        prev ? { ...prev, icon: e.target.value } : null
                                      )}
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleSaveEditedProduct}>
                                  Salvar Alterações
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          {/* Botão: Remover produto */}
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
          
          {/* ==============================================================
              ABA: ADICIONAR
              Formulário para novo produto
              ============================================================== */}
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
                  {/* Campo: Nome do produto */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Arroz integral"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  {/* Campo: Categoria */}
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
                  
                  {/* Campo: Preço */}
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
                  
                  {/* Campo: Quantidade e Unidade */}
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
                  
                  {/* Campo: Emoji (opcional) */}
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
                
                {/* Botão de adicionar */}
                <Button onClick={handleAddProduct} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
        </Tabs>
      </main>
    </div>
  );
};

export default ProductCatalog;
