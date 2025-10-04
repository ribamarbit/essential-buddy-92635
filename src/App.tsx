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
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Configurar autenticação com Supabase
  useEffect(() => {
    // Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsValidating(false);
        
        // Mostrar guia para novos usuários
        if (session?.user && !localStorage.getItem('hasSeenGuide')) {
          setTimeout(() => {
            setShowUserGuide(true);
          }, 500);
        }
      }
    );

    // DEPOIS verificar se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsValidating(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // O login é gerenciado pelo Supabase Auth
    // Esta função é mantida para compatibilidade
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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

    if (!session || !user) {
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

  if (!session || !user) {
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
