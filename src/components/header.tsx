import { useState } from "react";
import { Bell, Settings, User, Home, Plus, ShoppingCart, X, Menu, Package, LogOut, Edit3, HelpCircle, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  notificationCount?: number;
  onLogout?: () => void;
  onShowGuide?: () => void;
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

const Header = ({ notificationCount = 0, onLogout, onShowGuide }: HeaderProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  // Settings state
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    autoAdd: true,
    priceAlerts: true
  });

  // Profile state
  const [profile, setProfile] = useState({
    name: "João da Silva",
    email: "joao@email.com",
    avatar: ""
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Configuração atualizada",
      description: `${key} foi ${value ? 'ativado' : 'desativado'}.`
    });
  };

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditingProfile(false);
    toast({
      title: "Perfil atualizado ✅",
      description: "Suas informações foram salvas com sucesso."
    });
  };

  const handleLogout = () => {
    toast({
      title: "Saindo da conta...",
      description: "Você será redirecionado para a tela de login."
    });
    if (onLogout) {
      onLogout();
    }
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
            
            <Link to="/products">
              <Button 
                variant={isActive("/products") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Produtos
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
            
            <Link to="/support">
              <Button 
                variant={isActive("/support") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
              >
                <HeadphonesIcon className="w-4 h-4" />
                Suporte
              </Button>
            </Link>
            
            <Link to="/perfil">
              <Button 
                variant={isActive("/perfil") ? "default" : "ghost"} 
                size="sm"
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Perfil
              </Button>
            </Link>
          </nav>

          {/* Navigation actions */}
          <div className="flex items-center gap-2">
            {/* Mobile menu - Menu hambúrguer para dispositivos móveis */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Menu de Navegação</SheetTitle>
                    <SheetDescription>Navegue pelas funcionalidades do app</SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-2">
                    {/* Links de navegação */}
                    <Link to="/" className="w-full block">
                      <Button 
                        variant={isActive("/") ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    
                    <Link to="/add-items" className="w-full block">
                      <Button 
                        variant={isActive("/add-items") ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar Itens
                      </Button>
                    </Link>
                    
                    <Link to="/products" className="w-full block">
                      <Button 
                        variant={isActive("/products") ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Produtos
                      </Button>
                    </Link>
                    
                    <Link to="/shopping-list" className="w-full block">
                      <Button 
                        variant={isActive("/shopping-list") ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Lista de Compras
                      </Button>
                    </Link>
                    
                    <Link to="/support" className="w-full block">
                      <Button 
                        variant={isActive("/support") ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <HeadphonesIcon className="w-4 h-4 mr-2" />
                        Suporte
                      </Button>
                    </Link>
                    
                    <Link to="/perfil" className="w-full block">
                      <Button 
                        variant={isActive("/perfil") ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Perfil
                      </Button>
                    </Link>

                    <Separator className="my-4" />

                    {/* Ações rápidas no menu mobile */}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start relative"
                      onClick={() => toggleSidebar('notifications')}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Notificações
                      {notificationCount > 0 && (
                        <Badge className="ml-auto bg-urgent text-urgent-foreground text-xs">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </Badge>
                      )}
                    </Button>

                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => toggleSidebar('settings')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Button>

                    {onShowGuide && (
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={onShowGuide}
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Manual de Instruções
                      </Button>
                    )}

                    <Separator className="my-4" />

                    {/* Botão de logout */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sair da conta
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Você será desconectado e redirecionado para a tela de login.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout}>Sair</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Dynamic Sidebar Tabs - Visível apenas em desktop */}
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
                      className="relative hidden md:flex"
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
                      <SheetDescription>
                        {tab.id === 'notifications' && 'Veja suas notificações e alertas importantes'}
                        {tab.id === 'settings' && 'Configure suas preferências do aplicativo'}
                        {tab.id === 'profile' && 'Visualize e edite suas informações de perfil'}
                      </SheetDescription>
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
                            <AvatarImage src={profile.avatar} />
                            <AvatarFallback className="text-lg">
                              {profile.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{profile.name}</h3>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
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
                          {/* Edit Profile Dialog */}
                          <AlertDialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => {
                                  setEditedProfile(profile);
                                  setIsEditingProfile(true);
                                }}
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Editar perfil
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Editar Perfil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Atualize suas informações pessoais.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Nome</Label>
                                  <Input
                                    id="edit-name"
                                    value={editedProfile.name}
                                    onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-email">E-mail</Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    value={editedProfile.email}
                                    onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSaveProfile}>
                                  Salvar alterações
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => toggleSidebar('settings')}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Preferências
                          </Button>

                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={onShowGuide}
                          >
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Guia do Usuário
                          </Button>

                          <Link to="/support" className="w-full">
                            <Button 
                              variant="outline" 
                              className="w-full justify-start"
                            >
                              <HeadphonesIcon className="w-4 h-4 mr-2" />
                              Suporte
                            </Button>
                          </Link>

                          {/* Logout Confirmation Dialog */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="w-full justify-start">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sair
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar saída</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLogout}>
                                  Sim, sair
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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