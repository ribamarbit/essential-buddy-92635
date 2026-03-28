import { useState, useEffect } from "react";
import ShoppingList from "@/components/shopping-list";
import { useToast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";

interface ShoppingItem {
  id: string; name: string; icon: string; priority: "urgent" | "warning" | "normal"; estimatedPrice: number;
}

const ShoppingListPage = () => {
  const { toast } = useToast();
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  const loadShoppingList = () => {
    try {
      const stored = localStorage.getItem('shoppingList');
      if (stored) { const parsed = JSON.parse(stored); setShoppingList(Array.isArray(parsed) ? parsed : []); }
      else setShoppingList([]);
    } catch { setShoppingList([]); }
  };

  useEffect(() => {
    loadShoppingList();
    const handleFocus = () => loadShoppingList();
    const handleStorage = (e: StorageEvent) => { if (e.key === 'shoppingList') loadShoppingList(); };
    const handleCustom = () => loadShoppingList();
    const interval = setInterval(loadShoppingList, 1000);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('shoppingListUpdated', handleCustom);
    return () => { clearInterval(interval); window.removeEventListener('focus', handleFocus); window.removeEventListener('storage', handleStorage); window.removeEventListener('shoppingListUpdated', handleCustom); };
  }, []);

  const handleRemoveFromCart = (itemId: string) => {
    const item = shoppingList.find(i => i.id === itemId);
    const updated = shoppingList.filter(i => i.id !== itemId);
    setShoppingList(updated);
    localStorage.setItem('shoppingList', JSON.stringify(updated));
    if (item) toast({ title: "Removido", description: `${item.name} foi removido.` });
  };

  const handleCheckout = () => {
    if (shoppingList.length === 0) { toast({ title: "Lista vazia", variant: "destructive" }); return; }
    const total = shoppingList.reduce((s, i) => s + i.estimatedPrice, 0);
    toast({ title: "Lista finalizada! ✅", description: `Total: R$ ${total.toFixed(2)} • ${shoppingList.length} itens.` });
    setTimeout(() => { setShoppingList([]); localStorage.setItem('shoppingList', JSON.stringify([])); }, 2000);
  };

  const handleShareList = async () => {
    if (shoppingList.length === 0) { toast({ title: "Lista vazia", variant: "destructive" }); return; }
    const text = `🛒 Lista de Compras\n\n${shoppingList.map((i, idx) => `${idx+1}. ${i.icon} ${i.name} - R$ ${i.estimatedPrice.toFixed(2)}`).join('\n')}\n\n💰 Total: R$ ${totalValue.toFixed(2)}`;
    try {
      if (navigator.share) { await navigator.share({ title: 'Lista de Compras', text }); }
      else { await navigator.clipboard.writeText(text); toast({ title: "Lista copiada! 📋" }); }
    } catch { toast({ title: "Erro ao compartilhar", variant: "destructive" }); }
  };

  const totalValue = shoppingList.reduce((s, i) => s + i.estimatedPrice, 0);
  const urgentItems = shoppingList.filter(i => i.priority === "urgent").length;

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Header */}
        <section>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2 font-headline">Lista de Compras</h2>
          <p className="text-muted-foreground font-medium">
            {shoppingList.length > 0 ? `${shoppingList.length} itens • Total: R$ ${totalValue.toFixed(2)}` : "Sua lista está vazia."}
          </p>
          {shoppingList.length > 0 && (
            <button onClick={handleShareList} className="mt-4 px-6 py-2 bg-secondary hover:bg-secondary/80 text-white rounded-full font-semibold text-sm flex items-center gap-2 transition-colors">
              <Share2 className="w-4 h-4" />Compartilhar
            </button>
          )}
        </section>

        {/* Stats */}
        {shoppingList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-highest/85 backdrop-blur-md p-6 rounded-3xl text-center">
              <div className="text-3xl font-extrabold text-foreground">{shoppingList.length}</div>
              <div className="text-sm text-muted-foreground font-label uppercase tracking-widest">Total de Itens</div>
            </div>
            <div className="bg-tertiary-fixed p-6 rounded-3xl text-center">
              <div className="text-3xl font-extrabold text-tertiary">{urgentItems}</div>
              <div className="text-sm text-muted-foreground font-label uppercase tracking-widest">Urgentes</div>
            </div>
            <div className="bg-primary-container p-6 rounded-3xl text-center text-white">
              <div className="text-3xl font-extrabold">R$ {totalValue.toFixed(2)}</div>
              <div className="text-sm opacity-80 font-label uppercase tracking-widest">Valor Estimado</div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="w-full max-w-2xl mx-auto">
          <ShoppingList items={shoppingList} onRemoveItem={handleRemoveFromCart} onCheckout={handleCheckout} />
        </div>
      </main>
    </div>
  );
};

export default ShoppingListPage;
