import { useState } from "react";
import { Bell, Settings, User, Home, Plus, ShoppingCart, Menu, Package, LogOut, Edit3, HelpCircle, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  notificationCount?: number;
  onLogout?: () => void;
  onShowGuide?: () => void;
}

const Header = ({ notificationCount = 0, onLogout, onShowGuide }: HeaderProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [settings, setSettings] = useState({ pushNotifications: true, emailNotifications: false, autoAdd: true, priceAlerts: true });
  const [profile, setProfile] = useState({ name: "João da Silva", email: "joao@email.com", avatar: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [sidebarOpen, setSidebarOpen] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  const handleSaveProfile = () => { setProfile(editedProfile); setIsEditingProfile(false); toast({ title: "Perfil atualizado ✅" }); };
  const handleLogout = () => { if (onLogout) onLogout(); };

  const notifications = [
    { id: 1, title: "Café acabando!", message: "Seu café deve acabar em 2 dias", time: "2h atrás", urgent: true },
    { id: 2, title: "Açúcar em falta", message: "Restam apenas 1 dia de açúcar", time: "4h atrás", urgent: true },
    { id: 3, title: "Promoção encontrada", message: "Arroz com 30% de desconto no Mercado X", time: "6h atrás", urgent: false },
  ];

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/add-items", label: "Cadastrar", icon: Plus },
    { path: "/products", label: "Produtos", icon: Package },
    { path: "/shopping-list", label: "Lista", icon: ShoppingCart },
    { path: "/support", label: "Suporte", icon: HeadphonesIcon },
    { path: "/perfil", label: "Perfil", icon: User },
  ];

  const bottomNavItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/products", label: "Produtos", icon: Package },
    { path: "/shopping-list", label: "Lista", icon: ShoppingCart },
    { path: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <>
      {/* Top AppBar */}
      <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          {/* Left: menu + brand */}
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden text-primary-container hover:bg-surface-variant/50 transition-colors active:scale-95 p-2 rounded-full">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Navegue pelas funcionalidades</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navItems.map(item => (
                    <Link key={item.path} to={item.path} className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant={isActive(item.path) ? "default" : "ghost"} className="w-full justify-start">
                        <item.icon className="w-4 h-4 mr-2" />{item.label}
                      </Button>
                    </Link>
                  ))}
                  <Separator className="my-4" />
                  {onShowGuide && (
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { onShowGuide(); setMobileMenuOpen(false); }}>
                      <HelpCircle className="w-4 h-4 mr-2" />Manual
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />Sair
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Sair da conta?</AlertDialogTitle><AlertDialogDescription>Você será redirecionado para o login.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleLogout}>Sair</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tighter text-primary-container">Concierge</h1>
            </Link>
          </div>

          {/* Center: desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path}>
                <Button variant={isActive(item.path) ? "default" : "ghost"} size="sm" className="gap-2">
                  <item.icon className="w-4 h-4" />{item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Sheet open={sidebarOpen === 'notifications'} onOpenChange={(o) => setSidebarOpen(o ? 'notifications' : null)}>
              <SheetTrigger asChild>
                <button className="hidden md:flex relative p-2 rounded-full hover:bg-surface-variant/50 transition-colors">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {notificationCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-tertiary rounded-full" />}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader><SheetTitle>Notificações</SheetTitle><SheetDescription>Alertas e atualizações</SheetDescription></SheetHeader>
                <div className="mt-6 space-y-4">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-3xl ${n.urgent ? 'bg-tertiary-fixed' : 'bg-surface-container-low'}`}>
                      <h4 className="font-medium text-sm">{n.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                      <span className="text-xs text-muted-foreground mt-2 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Settings */}
            <Sheet open={sidebarOpen === 'settings'} onOpenChange={(o) => setSidebarOpen(o ? 'settings' : null)}>
              <SheetTrigger asChild>
                <button className="hidden md:flex p-2 rounded-full hover:bg-surface-variant/50 transition-colors">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader><SheetTitle>Configurações</SheetTitle><SheetDescription>Suas preferências</SheetDescription></SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium font-label text-xs uppercase tracking-widest text-muted-foreground">Notificações</h4>
                    <div className="flex items-center justify-between"><Label>Push</Label><Switch checked={settings.pushNotifications} onCheckedChange={(c) => updateSetting('pushNotifications', c)} /></div>
                    <div className="flex items-center justify-between"><Label>E-mail</Label><Switch checked={settings.emailNotifications} onCheckedChange={(c) => updateSetting('emailNotifications', c)} /></div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium font-label text-xs uppercase tracking-widest text-muted-foreground">Aparência</h4>
                    <div className="flex items-center justify-between"><Label>Modo escuro</Label><Switch checked={isDark} onCheckedChange={toggleTheme} /></div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Profile avatar */}
            <Sheet open={sidebarOpen === 'profile'} onOpenChange={(o) => setSidebarOpen(o ? 'profile' : null)}>
              <SheetTrigger asChild>
                <button className="hidden md:flex">
                  <Avatar className="w-10 h-10 border-2 border-primary-container/20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="bg-surface-container-high text-sm">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader><SheetTitle>Perfil</SheetTitle><SheetDescription>Suas informações</SheetDescription></SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16"><AvatarImage src={profile.avatar} /><AvatarFallback className="text-lg">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    <div><h3 className="font-medium">{profile.name}</h3><p className="text-sm text-muted-foreground">{profile.email}</p></div>
                  </div>
                  <Separator />
                  <AlertDialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" onClick={() => { setEditedProfile(profile); setIsEditingProfile(true); }}>
                        <Edit3 className="w-4 h-4 mr-2" />Editar perfil
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Editar Perfil</AlertDialogTitle><AlertDialogDescription>Atualize suas informações.</AlertDialogDescription></AlertDialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2"><Label>Nome</Label><Input value={editedProfile.name} onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))} /></div>
                        <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={editedProfile.email} onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))} /></div>
                      </div>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleSaveProfile}>Salvar</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {onShowGuide && <Button variant="outline" className="w-full justify-start" onClick={onShowGuide}><HelpCircle className="w-4 h-4 mr-2" />Guia</Button>}
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" className="w-full justify-start"><LogOut className="w-4 h-4 mr-2" />Sair</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Confirmar saída</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja sair?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleLogout}>Sim, sair</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar - Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-background/85 backdrop-blur-md z-50 rounded-t-[2rem] border-t border-border/20 shadow-[0_-8px_24px_rgba(28,28,25,0.06)]">
        {bottomNavItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all active:scale-90 duration-200 ${
              isActive(item.path)
                ? 'bg-primary-container text-white'
                : 'text-muted-foreground hover:text-primary-container'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-label text-[11px] font-medium tracking-[0.05em] uppercase mt-0.5">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Header;
