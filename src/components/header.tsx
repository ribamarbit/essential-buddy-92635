import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  notificationCount?: number;
}

const Header = ({ notificationCount = 0 }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
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
          </div>

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