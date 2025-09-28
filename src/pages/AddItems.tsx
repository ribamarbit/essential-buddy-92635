import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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