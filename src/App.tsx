/**
 * =============================================================================
 * APP.TSX - Componente Principal da Aplicação
 * =============================================================================
 * 
 * Este é o componente raiz da aplicação Concierge de Compras.
 * Responsável por:
 * - Configurar providers globais (QueryClient, Tooltip, etc.)
 * - Gerenciar autenticação com Supabase
 * - Definir rotas da aplicação
 * - Controlar proteção de rotas
 * - Renderizar componentes globais (Header, Accessibility, Virtual Assistant)
 * 
 * =============================================================================
 */

// Hooks do React para gerenciamento de estado e efeitos colaterais
import { useState, useEffect } from "react";

// Componentes de notificação/toast
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Provider de tooltips do Radix UI
import { TooltipProvider } from "@/components/ui/tooltip";

// React Query para gerenciamento de estado assíncrono
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// React Router para navegação entre páginas
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas da aplicação
import Dashboard from "./pages/Dashboard";
import AddItems from "./pages/AddItems";
import ProductCatalog from "./pages/ProductCatalog";
import ShoppingListPage from "./pages/ShoppingListPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Support from "./pages/Support";
import Profile from "./pages/Profile";

// Componentes globais da aplicação
import Header from "./components/header";
import AccessibilityPanel from "./components/accessibility-panel";
import UserGuide from "./components/user-guide";
import VirtualAssistant from "./components/virtual-assistant";

// Cliente Supabase para autenticação
import { supabase } from "@/integrations/supabase/client";

// Tipos do Supabase para tipagem TypeScript
import type { User, Session } from "@supabase/supabase-js";

/**
 * Instância do QueryClient para React Query
 * Usado para cache e gerenciamento de requisições assíncronas
 */
const queryClient = new QueryClient();

/**
 * Componente Principal App
 * 
 * Gerencia todo o estado global da aplicação incluindo:
 * - Autenticação de usuários
 * - Exibição do guia do usuário
 * - Proteção de rotas
 */
const App = () => {
  // Estado do usuário autenticado (null se não autenticado)
  const [user, setUser] = useState<User | null>(null);
  
  // Estado da sessão do Supabase
  const [session, setSession] = useState<Session | null>(null);
  
  // Controla exibição do guia do usuário para novos usuários
  const [showUserGuide, setShowUserGuide] = useState(false);
  
  // Indica se está validando a autenticação (loading state)
  const [isValidating, setIsValidating] = useState(true);

  /**
   * Effect para configurar autenticação com Supabase
   * 
   * 1. Configura listener para mudanças no estado de autenticação
   * 2. Verifica se já existe uma sessão ativa
   * 3. Mostra guia do usuário para novos usuários
   */
  useEffect(() => {
    // Configura listener de mudanças de auth PRIMEIRO
    // Isso garante que qualquer mudança de estado seja capturada
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Atualiza estado da sessão e usuário
        setSession(session);
        setUser(session?.user ?? null);
        setIsValidating(false);
        
        // Mostra guia para novos usuários que nunca viram antes
        if (session?.user && !localStorage.getItem('hasSeenGuide')) {
          setTimeout(() => {
            setShowUserGuide(true);
          }, 500);
        }
      }
    );

    // DEPOIS verifica se já existe uma sessão ativa
    // Isso é necessário para usuários que já estavam logados
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsValidating(false);
    });

    // Cleanup: cancela a subscription quando o componente é desmontado
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Handler de login
   * Mantido para compatibilidade - o login real é gerenciado pelo Supabase Auth
   */
  const handleLogin = () => {
    // O login é gerenciado pelo Supabase Auth
    // Esta função é mantida para compatibilidade com props
  };

  /**
   * Handler de logout
   * Faz signOut no Supabase e limpa estados locais
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  /**
   * Handler para fechar o guia do usuário
   * Marca no localStorage que o usuário já viu o guia
   */
  const handleCloseGuide = () => {
    localStorage.setItem('hasSeenGuide', 'true');
    setShowUserGuide(false);
  };

  /**
   * Componente de Proteção de Rota
   * 
   * Verifica se o usuário está autenticado antes de renderizar rotas protegidas.
   * Se não estiver autenticado, redireciona para a página de login.
   * 
   * @param children - Componentes filhos a serem renderizados se autenticado
   */
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // Mostra loading enquanto valida autenticação
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

    // Redireciona para login se não autenticado
    if (!session || !user) {
      return <Navigate to="/login" replace />;
    }

    // Renderiza os filhos se autenticado
    return <>{children}</>;
  };

  // ============================================================================
  // RENDERIZAÇÃO CONDICIONAL
  // ============================================================================

  /**
   * Estado de Loading Global
   * Exibido enquanto verifica se existe sessão ativa
   */
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

  /**
   * Estado Não Autenticado
   * Mostra apenas a página de login e redireciona outras rotas
   */
  if (!session || !user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* Componentes de notificação */}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rota de login */}
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              {/* Qualquer outra rota redireciona para login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  /**
   * Estado Autenticado
   * Renderiza a aplicação completa com todas as rotas protegidas
   */
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Componentes de notificação */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            {/* Header global com navegação e ações do usuário */}
            <Header notificationCount={3} onLogout={handleLogout} onShowGuide={() => setShowUserGuide(true)} />
            
            {/* Definição de Rotas da Aplicação */}
            <Routes>
              {/* Redireciona login para home se já autenticado */}
              <Route path="/login" element={<Navigate to="/" replace />} />
              
              {/* Dashboard - Página inicial com itens essenciais */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* Cadastrar Itens - Adiciona itens ao Dashboard */}
              <Route path="/add-items" element={<ProtectedRoute><AddItems /></ProtectedRoute>} />
              
              {/* Catálogo de Produtos - Gerencia produtos disponíveis */}
              <Route path="/products" element={<ProtectedRoute><ProductCatalog /></ProtectedRoute>} />
              
              {/* Lista de Compras - Itens a serem comprados */}
              <Route path="/shopping-list" element={<ProtectedRoute><ShoppingListPage /></ProtectedRoute>} />
              
              {/* Suporte - Central de ajuda */}
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              
              {/* Perfil - Informações do usuário */}
              <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Rota 404 - Página não encontrada */}
              {/* IMPORTANTE: Manter sempre por último */}
              <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
            </Routes>
            
            {/* Componentes Globais Flutuantes */}
            <AccessibilityPanel />  {/* Painel de acessibilidade (canto inferior esquerdo) */}
            <VirtualAssistant />    {/* Assistente virtual (canto inferior direito) */}
            
            {/* Guia do Usuário - Modal para novos usuários */}
            <UserGuide isOpen={showUserGuide} onClose={handleCloseGuide} />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
