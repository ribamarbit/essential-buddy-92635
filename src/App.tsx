import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);

  // Não verificamos localStorage - sempre inicia com login necessário
  useEffect(() => {
    // Limpa o localStorage ao carregar para garantir que sempre comece com login
    localStorage.removeItem('isLoggedIn');
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    
    // Show guide for new users
    if (!localStorage.getItem('hasSeenGuide')) {
      setShowUserGuide(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  const handleCloseGuide = () => {
    localStorage.setItem('hasSeenGuide', 'true');
    setShowUserGuide(false);
  };

  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Login onLogin={handleLogin} />
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
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-items" element={<AddItems />} />
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/shopping-list" element={<ShoppingListPage />} />
              <Route path="/support" element={<Support />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
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
