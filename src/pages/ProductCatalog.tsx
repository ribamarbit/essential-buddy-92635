import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit3, Search } from "lucide-react";

interface Product {
  id: string; name: string; category: string; price: number; quantity: number; unit: string; icon?: string;
}

const ProductCatalog = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [newProduct, setNewProduct] = useState({ name: "", category: "", price: "", quantity: "", unit: "un", icon: "" });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [scanText, setScanText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["Grãos", "Laticínios", "Carnes", "Verduras", "Frutas", "Limpeza", "Higiene", "Bebidas", "Outros"];
  const units = ["un", "kg", "g", "L", "ml", "pacote", "caixa"];

  useEffect(() => {
    const stored = localStorage.getItem('catalogProducts');
    if (stored) { try { setProducts(JSON.parse(stored)); } catch {} }
    else {
      const defaults = [
        { id: "1", name: "Arroz Agulhinha Premium", category: "Grãos", price: 28.90, quantity: 5, unit: "kg", icon: "🍚" },
        { id: "2", name: "Feijão Preto Selecionado", category: "Grãos", price: 9.45, quantity: 1, unit: "kg", icon: "🫘" },
        { id: "3", name: "Azeite Extra Virgem", category: "Outros", price: 42.00, quantity: 1, unit: "un", icon: "🫒" },
        { id: "4", name: "Farinha de Trigo Orgânica", category: "Grãos", price: 12.30, quantity: 1, unit: "kg", icon: "🌾" },
      ];
      setProducts(defaults);
      localStorage.setItem('catalogProducts', JSON.stringify(defaults));
    }
  }, []);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) { toast({ title: "Campos obrigatórios", description: "Nome, preço e quantidade são obrigatórios." }); return; }
    const product: Product = { id: Date.now().toString(), name: newProduct.name, category: newProduct.category || "Outros", price: parseFloat(newProduct.price), quantity: parseInt(newProduct.quantity), unit: newProduct.unit, icon: newProduct.icon || "📦" };
    const updated = [...products, product];
    setProducts(updated);
    localStorage.setItem('catalogProducts', JSON.stringify(updated));
    setNewProduct({ name: "", category: "", price: "", quantity: "", unit: "un", icon: "" });
    toast({ title: "Produto adicionado! ✅", description: `${product.name} foi cadastrado.` });
  };

  const handleRemoveProduct = (id: string) => {
    const p = products.find(p => p.id === id);
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('catalogProducts', JSON.stringify(updated));
    toast({ title: "Produto removido", description: `${p?.name} foi removido.` });
  };

  const handleSaveEditedProduct = () => {
    if (!editingProduct) return;
    const updated = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    setProducts(updated);
    localStorage.setItem('catalogProducts', JSON.stringify(updated));
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    toast({ title: "Produto atualizado! ✅" });
  };

  const handleAddToShoppingList = (product: Product) => {
    const shoppingItem = { id: Date.now().toString(), name: product.name, icon: product.icon || "📦", priority: "normal" as const, estimatedPrice: product.price };
    const existing = localStorage.getItem('shoppingList');
    const currentList = existing ? JSON.parse(existing) : [];
    if (currentList.some((i: any) => i.name === product.name)) { toast({ title: "Item já na lista", description: `${product.name} já está na Lista de Compras.` }); return; }
    const updated = [...currentList, shoppingItem];
    localStorage.setItem('shoppingList', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('shoppingListUpdated'));
    toast({ title: "Adicionado à Lista! 🛒", description: `${product.name} foi adicionado.` });
  };

  const handleScanProcess = () => {
    if (!scanText.trim()) { toast({ title: "Texto vazio" }); return; }
    setIsProcessing(true);
    setTimeout(() => {
      const lines = scanText.split('\n').filter(l => l.trim());
      const extracted: any[] = [];
      lines.forEach(line => {
        const match = line.match(/(.+?)\s+(\d+(?:\.\d+)?)\s*(\w+)?\s+R?\$?\s*(\d+[.,]\d{2})/i);
        if (match) {
          const [, name, qty, , price] = match;
          extracted.push({ id: Date.now().toString() + Math.random(), name: name.trim(), icon: "📦", totalDays: Math.ceil(parseFloat(qty) * 7), estimatedPrice: parseFloat(price.replace(',', '.')), startDate: Date.now() });
        }
      });
      if (extracted.length > 0) {
        const existing = localStorage.getItem('dashboardEssentials');
        const current = existing ? JSON.parse(existing) : [];
        localStorage.setItem('dashboardEssentials', JSON.stringify([...current, ...extracted]));
        window.dispatchEvent(new CustomEvent('dashboardUpdated'));
        setScanText("");
        toast({ title: `${extracted.length} itens extraídos! ✅`, description: "Itens foram adicionados ao Dashboard." });
      } else {
        toast({ title: "Nenhum produto encontrado" });
      }
      setIsProcessing(false);
    }, 2000);
  };

  const totalValue = products.reduce((s, p) => s + (p.price * p.quantity), 0);
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "Todos" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const allCategories = ["Todos", ...new Set(products.map(p => p.category))];

  const getStockStatus = (quantity: number) => {
    if (quantity <= 2) return { label: "Baixo Estoque", bg: "bg-tertiary-fixed text-tertiary", accent: true };
    return { label: "Em Estoque", bg: "bg-primary-fixed text-primary", accent: false };
  };

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Summary Header */}
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <p className="font-label text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">Resumo de Ativos</p>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md leading-relaxed">
              Valor total estimado em estoque. Otimize sua reposição baseada nas métricas de saída diária.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-label text-xs uppercase tracking-widest text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold text-foreground">{products.length} SKUs</p>
              </div>
              <div className="h-12 w-1 bg-primary-container rounded-full" />
            </div>
            <div className="bg-primary-container p-6 rounded-xl flex items-center justify-between text-white shadow-lg shadow-primary/10">
              <div>
                <p className="font-label text-xs uppercase tracking-widest opacity-80">Quantidade Total</p>
                <p className="text-2xl font-bold">{products.reduce((s, p) => s + p.quantity, 0)} un</p>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-lg focus:ring-0 focus:bg-surface-container-lowest transition-all placeholder:text-muted-foreground/60 font-medium"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-container-high text-muted-foreground hover:bg-surface-variant'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-surface-container-high rounded-full p-1">
            <TabsTrigger value="catalog" className="rounded-full">Catálogo</TabsTrigger>
            <TabsTrigger value="add" className="rounded-full">Adicionar</TabsTrigger>
            <TabsTrigger value="scanner" className="rounded-full">Scanner</TabsTrigger>
          </TabsList>

          {/* Catalog Tab - Card Grid */}
          <TabsContent value="catalog">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-muted-foreground">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map(product => {
                  const stock = getStockStatus(product.quantity);
                  return (
                    <div key={product.id} className="group relative flex flex-col bg-surface-container-highest rounded-xl overflow-hidden transition-all hover:translate-y-[-4px] hover:shadow-float">
                      {/* Product image area */}
                      <div className="aspect-[4/3] overflow-hidden relative bg-surface-container-high flex items-center justify-center">
                        <span className="text-7xl">{product.icon}</span>
                        <div className="absolute top-4 left-4">
                          <span className={`${stock.bg} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest`}>
                            {stock.label}
                          </span>
                        </div>
                        {stock.accent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary-container" />}
                      </div>
                      {/* Product info */}
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="mb-4">
                          <h3 className="font-headline text-lg font-bold text-foreground">{product.name}</h3>
                          <p className="text-xs font-label uppercase tracking-widest text-muted-foreground mt-1">{product.category} • {product.quantity} {product.unit}</p>
                        </div>
                        <div className="mt-auto flex items-end justify-between">
                          <p className="text-2xl font-extrabold text-foreground">R$ {product.price.toFixed(2)}</p>
                          <div className="flex gap-1">
                            <button onClick={() => handleAddToShoppingList(product)} className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center active:scale-90 transition-transform">
                              <Plus className="w-5 h-5" />
                            </button>
                            <button onClick={() => { setEditingProduct(product); setIsEditDialogOpen(true); }} className="w-10 h-10 rounded-full bg-surface-variant text-muted-foreground flex items-center justify-center active:scale-90 transition-transform hover:bg-surface-container-high">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRemoveProduct(product.id)} className="w-10 h-10 rounded-full bg-surface-variant text-muted-foreground flex items-center justify-center active:scale-90 transition-transform hover:bg-tertiary-fixed hover:text-tertiary">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Add Tab */}
          <TabsContent value="add">
            <div className="bg-surface-container-low p-8 rounded-3xl max-w-2xl mx-auto">
              <h3 className="font-headline text-2xl font-bold text-foreground mb-6">Adicionar Produto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-label text-xs uppercase tracking-widest text-muted-foreground">Nome</Label>
                  <Input placeholder="Ex: Arroz integral" value={newProduct.name} onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))} className="rounded-xl bg-surface-container-highest border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="font-label text-xs uppercase tracking-widest text-muted-foreground">Categoria</Label>
                  <select className="flex h-10 w-full rounded-xl border-none bg-surface-container-highest px-3 py-2 text-sm" value={newProduct.category} onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}>
                    <option value="">Selecione</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-label text-xs uppercase tracking-widest text-muted-foreground">Preço (R$)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))} className="rounded-xl bg-surface-container-highest border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="font-label text-xs uppercase tracking-widest text-muted-foreground">Quantidade</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="1" value={newProduct.quantity} onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))} className="flex-1 rounded-xl bg-surface-container-highest border-none" />
                    <select className="w-20 flex h-10 rounded-xl border-none bg-surface-container-highest px-3 py-2 text-sm" value={newProduct.unit} onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}>
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-label text-xs uppercase tracking-widest text-muted-foreground">Emoji</Label>
                  <Input placeholder="Ex: 🍚, 🥛, 🍞..." value={newProduct.icon} onChange={(e) => setNewProduct(prev => ({ ...prev, icon: e.target.value }))} className="rounded-xl bg-surface-container-highest border-none" />
                </div>
              </div>
              <button onClick={handleAddProduct} className="w-full mt-6 bg-primary-container hover:bg-primary text-white font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                <Plus className="w-5 h-5 inline mr-2" />Adicionar Produto
              </button>
            </div>
          </TabsContent>

          {/* Scanner Tab */}
          <TabsContent value="scanner">
            <div className="bg-surface-container-low p-8 rounded-3xl max-w-2xl mx-auto">
              <h3 className="font-headline text-2xl font-bold text-foreground mb-2">Scanner Inteligente</h3>
              <p className="text-muted-foreground mb-6">Cole o texto da nota fiscal ou lista de compras para importar automaticamente ao Dashboard.</p>
              <Textarea placeholder={"Exemplo:\nArroz 5 kg R$ 28,90\nFeijão 2 kg R$ 9,45"} value={scanText} onChange={(e) => setScanText(e.target.value)} className="min-h-[200px] rounded-xl bg-surface-container-highest border-none mb-4" />
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) toast({ title: "Upload em desenvolvimento" }); }} />
              <div className="flex gap-3">
                <button onClick={handleScanProcess} disabled={isProcessing} className="flex-1 bg-primary-container hover:bg-primary text-white font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50">
                  {isProcessing ? "Processando..." : "Processar Texto"}
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-4 bg-secondary hover:bg-secondary/80 text-white rounded-full font-semibold transition-colors">
                  Upload
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Tonal Section */}
        <section className="mt-20 p-8 bg-surface-container-low rounded-[2rem]">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground leading-tight">Gestão Curatorial de Inventário</h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Nossa plataforma fornece uma visão editorial do seu negócio. Cada item é tratado com a importância que merece.
              </p>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4 w-full">
              <div className="aspect-square bg-surface-container-highest rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                <span className="text-4xl text-primary-container mb-2">📦</span>
                <p className="font-bold text-2xl">{products.length}</p>
                <p className="text-xs uppercase font-label tracking-tighter text-muted-foreground">Produtos Ativos</p>
              </div>
              <div className="aspect-square bg-surface-container-highest rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                <span className="text-4xl text-tertiary-container mb-2">⚠️</span>
                <p className="font-bold text-2xl">{products.filter(p => p.quantity <= 2).length}</p>
                <p className="text-xs uppercase font-label tracking-tighter text-muted-foreground">Alertas Críticos</p>
              </div>
            </div>
          </div>
        </section>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar Produto</DialogTitle><DialogDescription>Atualize as informações.</DialogDescription></DialogHeader>
            {editingProduct && (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nome</Label><Input value={editingProduct.name} onChange={(e) => setEditingProduct(p => p ? { ...p, name: e.target.value } : null)} /></div>
                  <div className="space-y-2"><Label>Categoria</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editingProduct.category} onChange={(e) => setEditingProduct(p => p ? { ...p, category: e.target.value } : null)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Preço</Label><Input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct(p => p ? { ...p, price: parseFloat(e.target.value) || 0 } : null)} /></div>
                  <div className="space-y-2"><Label>Qtd</Label><Input type="number" value={editingProduct.quantity} onChange={(e) => setEditingProduct(p => p ? { ...p, quantity: parseInt(e.target.value) || 0 } : null)} /></div>
                  <div className="space-y-2"><Label>Un</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editingProduct.unit} onChange={(e) => setEditingProduct(p => p ? { ...p, unit: e.target.value } : null)}>{units.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                </div>
                <div className="space-y-2"><Label>Emoji</Label><Input value={editingProduct.icon} onChange={(e) => setEditingProduct(p => p ? { ...p, icon: e.target.value } : null)} /></div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEditedProduct}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ProductCatalog;
