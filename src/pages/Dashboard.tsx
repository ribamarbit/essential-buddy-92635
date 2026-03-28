import { useState, useEffect } from "react";
import DashboardStats from "@/components/dashboard-stats";
import ItemCard from "@/components/item-card";
import { useToast } from "@/hooks/use-toast";

interface EssentialItem {
  id: string; name: string; icon: string; daysLeft: number; totalDays: number;
  status: "success" | "warning" | "urgent"; estimatedPrice: number; startDate: number;
}
interface ShoppingItem {
  id: string; name: string; icon: string; priority: "urgent" | "warning" | "normal"; estimatedPrice: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [essentialItems, setEssentialItems] = useState<EssentialItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  const loadEssentialItems = () => {
    const stored = localStorage.getItem('dashboardEssentials');
    if (stored) {
      try {
        const essentials = JSON.parse(stored);
        const items: EssentialItem[] = essentials.map((item: any) => {
          const startDate = item.startDate || Date.now();
          const totalDays = item.totalDays || 30;
          const daysPassed = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24));
          const daysLeft = Math.max(0, totalDays - daysPassed);
          let status: "success" | "warning" | "urgent" = "success";
          if (daysLeft <= 2) status = "urgent";
          else if (daysLeft <= 5) status = "warning";
          return { id: item.id || Date.now().toString(), name: item.name, icon: item.icon || "📦", daysLeft, totalDays, status, estimatedPrice: item.estimatedPrice || 5.0, startDate };
        });
        setEssentialItems(items);
      } catch { /* silent */ }
    } else {
      const d13 = Date.now() - (13 * 24 * 60 * 60 * 1000);
      setEssentialItems([
        { id: "1", name: "Café", icon: "☕", daysLeft: 2, totalDays: 15, status: "urgent", estimatedPrice: 12.90, startDate: d13 },
        { id: "2", name: "Leite", icon: "🥛", daysLeft: 5, totalDays: 7, status: "warning", estimatedPrice: 4.50, startDate: Date.now() - (2 * 86400000) },
        { id: "3", name: "Arroz", icon: "🍚", daysLeft: 12, totalDays: 30, status: "success", estimatedPrice: 8.99, startDate: Date.now() - (18 * 86400000) },
      ]);
    }
  };

  const loadShoppingList = () => {
    const stored = localStorage.getItem('shoppingList');
    if (stored) { try { setShoppingList(JSON.parse(stored)); } catch { /* */ } }
  };

  useEffect(() => {
    loadEssentialItems(); loadShoppingList();
    const h1 = () => loadEssentialItems(); const h2 = () => loadShoppingList(); const h3 = () => { loadEssentialItems(); loadShoppingList(); };
    window.addEventListener('dashboardUpdated', h1); window.addEventListener('shoppingListUpdated', h2); window.addEventListener('focus', h3);
    return () => { window.removeEventListener('dashboardUpdated', h1); window.removeEventListener('shoppingListUpdated', h2); window.removeEventListener('focus', h3); };
  }, []);

  useEffect(() => { const i = setInterval(() => loadEssentialItems(), 3600000); return () => clearInterval(i); }, []);

  const stats = {
    itemsRunningOut: essentialItems.filter(i => i.status === "urgent").length,
    avgDaysToRefill: essentialItems.length ? Math.round(essentialItems.reduce((s, i) => s + i.daysLeft, 0) / essentialItems.length) : 0,
    pendingItems: shoppingList.length,
    monthlySavings: 47.80,
  };

  const handleAddToCart = (itemId: string) => {
    const item = essentialItems.find(i => i.id === itemId);
    if (!item) return;
    if (shoppingList.some(i => i.id === itemId)) { toast({ title: "Item já na lista! 📝", description: `${item.name} já está na sua lista de compras.` }); return; }
    const newItem: ShoppingItem = { id: item.id, name: item.name, icon: item.icon, priority: item.status === "urgent" ? "urgent" : item.status === "warning" ? "warning" : "normal", estimatedPrice: item.estimatedPrice };
    const updated = [...shoppingList, newItem];
    setShoppingList(updated);
    localStorage.setItem('shoppingList', JSON.stringify(updated));
    toast({ title: "Adicionado à lista! ✅", description: `${item.name} foi adicionado à sua lista de compras.` });
  };

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-12">
        {/* Greeting */}
        <section>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2 font-headline">
            Monitoramento
          </h2>
          <p className="text-muted-foreground font-medium tracking-wide">
            Visão geral do inventário da unidade central.
          </p>
        </section>

        {/* Bento Stats */}
        <DashboardStats stats={stats} />

        {/* Essential Items */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-bold tracking-tight text-foreground font-headline">Itens Essenciais</h3>
            {stats.itemsRunningOut > 0 && (
              <span className="text-tertiary font-semibold text-sm">{stats.itemsRunningOut} acabando</span>
            )}
          </div>
          <div className="space-y-4">
            {essentialItems.map(item => (
              <ItemCard key={item.id} {...item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
