import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddItems from "./pages/AddItems";
import ProductCatalog from "./pages/ProductCatalog";
import ShoppingListPage from "./pages/ShoppingListPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Support from "./pages/Support";
import Header from "./components/header";
import AccessibilityPanel from "./components/accessibility-panel";
import UserGuide from "./components/user-guide";
import VirtualAssistant from "./components/virtual-assistant";
import { validateAuth, setAuth, clearAuth, renewSession } from "./utils/authValidation";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Validação de autenticação ao carregar
  useEffect(() => {
    const checkAuth = () => {
      const isValid = validateAuth();
      setIsLoggedIn(isValid);
      setIsValidating(false);
    };

    checkAuth();

    // Renova sessão periodicamente
    const interval = setInterval(() => {
      if (validateAuth()) {
        renewSession();
      } else {
        setIsLoggedIn(false);
      }
    }, 60000); // Verifica a cada minuto

    return () => clearInterval(interval);
  }, []);

  // Proteção contra manipulação do DOM
  useEffect(() => {
    if (!isValidating && !isLoggedIn) {
      // Remove qualquer tentativa de bypass via console
      Object.defineProperty(window, 'isLoggedIn', {
        get: () => false,
        set: () => false,
        configurable: false
      });
    }
  }, [isLoggedIn, isValidating]);

  const handleLogin = () => {
    setAuth();
    setIsLoggedIn(true);
    
    // Show guide for new users
    if (!localStorage.getItem('hasSeenGuide')) {
      setShowUserGuide(true);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
  };

  const handleCloseGuide = () => {
    localStorage.setItem('hasSeenGuide', 'true');
    setShowUserGuide(false);
  };

  // Componente de proteção de rota
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isValidating) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Verificando autenticação...</p>
          </div>
        </div>
      );
    }

    if (!validateAuth()) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  };

  if (isValidating) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header notificationCount={3} onLogout={handleLogout} onShowGuide={() => setShowUserGuide(true)} />
            <Routes>
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/add-items" element={<ProtectedRoute><AddItems /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><ProductCatalog /></ProtectedRoute>} />
              <Route path="/shopping-list" element={<ProtectedRoute><ShoppingListPage /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
            </Routes>
            <AccessibilityPanel />
            <VirtualAssistant />
            <UserGuide isOpen={showUserGuide} onClose={handleCloseGuide} />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
