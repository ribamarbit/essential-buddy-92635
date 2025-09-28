import { useState } from "react";
import { Bell, Settings, User, Home, Plus, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

interface HeaderProps {
  notificationCount?: number;
}

// Configuration for sidebar tabs - easily extensible for future additions
const sidebarTabs = {
  notifications: {
    id: 'notifications',
    icon: Bell,
    title: 'Notificações',
    hasNotificationBadge: true
  },
  settings: {
    id: 'settings',
    icon: Settings,
    title: 'Configurações',
    hasNotificationBadge: false
  },
  profile: {
    id: 'profile',
    icon: User,
    title: 'Perfil',
    hasNotificationBadge: false
  }
};

const Header = ({ notificationCount = 0 }: HeaderProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { isDark, toggleTheme } = useTheme();
  
  // Settings state
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    autoAdd: true,
    priceAlerts: true
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  // Dynamic state management for sidebar tabs
  const [openSidebars, setOpenSidebars] = useState<Record<string, boolean>>({
    notifications: false,
    settings: false,
    profile: false
  });

  const toggleSidebar = (tabId: string) => {
    setOpenSidebars(prev => ({
      ...prev,
      [tabId]: !prev[tabId]
    }));
  };

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "Café acabando!",
      message: "Seu café deve acabar em 2 dias",
      time: "2h atrás",
      urgent: true
    },
    {
      id: 2,
      title: "Açúcar em falta",
      message: "Restam apenas 1 dia de açúcar",
      time: "4h atrás",
      urgent: true
    },
    {
      id: 3,
      title: "Promoção encontrada",
      message: "Arroz com 30% de desconto no Mercado X",
      time: "6h atrás",
      urgent: false
    }
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
              🛒
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Concierge
              </h1>
              <p className="text-xs text-muted-foreground">
                Suas compras inteligentes
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button 
                variant={isActive("/") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Início
              </Button>
            </Link>
            
            <Link to="/add-items">
              <Button 
                variant={isActive("/add-items") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Cadastrar
              </Button>
            </Link>
            
            <Link to="/shopping-list">
              <Button 
                variant={isActive("/shopping-list") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Lista
              </Button>
            </Link>
          </nav>

          {/* Navigation actions */}
          <div className="flex items-center gap-2">
            {/* Mobile shopping list */}
            <div className="md:hidden">
              <Link to="/shopping-list">
                <Button 
                  variant={isActive("/shopping-list") ? "default" : "ghost"} 
                  size="sm"
                >
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Dynamic Sidebar Tabs */}
            {Object.values(sidebarTabs).map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Sheet 
                  key={tab.id}
                  open={openSidebars[tab.id]} 
                  onOpenChange={() => toggleSidebar(tab.id)}
                >
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="relative"
                    >
                      <IconComponent className="w-5 h-5" />
                      {tab.hasNotificationBadge && notificationCount > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 bg-urgent text-urgent-foreground text-xs min-w-5 h-5 flex items-center justify-center p-0"
                        >
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5" />
                        {tab.title}
                      </SheetTitle>
                    </SheetHeader>
                    
                    {/* Notifications Content */}
                    {tab.id === 'notifications' && (
                      <div className="mt-6 space-y-4">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-4 rounded-lg border ${
                              notification.urgent ? 'border-urgent/20 bg-urgent/5' : 'border-border'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <span className="text-xs text-muted-foreground mt-2 block">
                                  {notification.time}
                                </span>
                              </div>
                              {notification.urgent && (
                                <Badge variant="destructive" className="ml-2">Urgente</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Settings Content */}
                    {tab.id === 'settings' && (
                      <div className="mt-6 space-y-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Notificações</h4>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="push-notifications">Notificações Push</Label>
                            <Switch
                              id="push-notifications"
                              checked={settings.pushNotifications}
                              onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="email-notifications">E-mail</Label>
                            <Switch
                              id="email-notifications"
                              checked={settings.emailNotifications}
                              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="font-medium">Compras</h4>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="auto-add">Adicionar automaticamente</Label>
                            <Switch
                              id="auto-add"
                              checked={settings.autoAdd}
                              onCheckedChange={(checked) => updateSetting('autoAdd', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="price-alerts">Alertas de preço</Label>
                            <Switch
                              id="price-alerts"
                              checked={settings.priceAlerts}
                              onCheckedChange={(checked) => updateSetting('priceAlerts', checked)}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="font-medium">Aparência</h4>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="dark-mode">Modo escuro</Label>
                            <Switch
                              id="dark-mode"
                              checked={isDark}
                              onCheckedChange={toggleTheme}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Profile Content */}
                    {tab.id === 'profile' && (
                      <div className="mt-6 space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-lg">JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">João da Silva</h3>
                            <p className="text-sm text-muted-foreground">joao@email.com</p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <h4 className="font-medium">Estatísticas</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-2xl font-bold text-foreground">47</div>
                              <div className="text-xs text-muted-foreground">Itens salvos</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-2xl font-bold text-foreground">R$ 247</div>
                              <div className="text-xs text-muted-foreground">Economia mensal</div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            <User className="w-4 h-4 mr-2" />
                            Editar perfil
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Settings className="w-4 h-4 mr-2" />
                            Preferências
                          </Button>
                          <Button variant="destructive" className="w-full justify-start">
                            <X className="w-4 h-4 mr-2" />
                            Sair
                          </Button>
                        </div>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;