import { Bell, Settings, User, Home, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";

interface HeaderProps {
  notificationCount?: number;
}

const Header = ({ notificationCount = 0 }: HeaderProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
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
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm"
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 bg-urgent text-urgent-foreground text-xs min-w-5 h-5 flex items-center justify-center p-0"
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Button>

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

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>

            {/* Profile */}
            <Button variant="ghost" size="sm">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;