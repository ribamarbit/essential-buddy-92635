/**
 * =============================================================================
 * PROFILE.TSX - Página de Perfil do Usuário
 * =============================================================================
 * 
 * Esta página exibe as informações do perfil do usuário autenticado.
 * Carrega dados do Supabase Auth e da tabela profiles.
 * 
 * Funcionalidades:
 * - Exibe nome completo, login e email do usuário
 * - Carrega dados do banco de dados Supabase
 * - Fallback para metadados do usuário se perfil não existir
 * - Exibe data de criação da conta
 * 
 * Fluxo de dados:
 * 1. Carrega usuário do Supabase Auth
 * 2. Busca perfil na tabela profiles
 * 3. Se não encontrar, usa metadados do usuário
 * 
 * =============================================================================
 */

// Importações do React
import { useEffect, useState } from "react";

// Componentes de UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Cliente Supabase
import { supabase } from "@/integrations/supabase/client";

// Hooks
import { useToast } from "@/hooks/use-toast";

// Tipos do Supabase
import { User } from "@supabase/supabase-js";

// Ícones
import { Loader2 } from "lucide-react";

/**
 * Componente principal da página de perfil
 */
const Profile = () => {
  // Hook para notificações toast
  const { toast } = useToast();
  
  // Estado de carregamento
  const [loading, setLoading] = useState(true);
  
  // Estado do usuário autenticado (Supabase Auth)
  const [user, setUser] = useState<User | null>(null);
  
  // Estado do perfil do usuário (tabela profiles)
  const [profile, setProfile] = useState<{
    nome_completo: string;
    login: string;
  } | null>(null);

  /**
   * Carrega os dados do perfil na inicialização
   * Busca primeiro o usuário autenticado, depois seus dados na tabela profiles
   */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Obtém o usuário autenticado do Supabase Auth
        const { data: { user } } = await supabase.auth.getUser();
        
        // Verifica se há usuário autenticado
        if (!user) {
          toast({
            title: "Erro",
            description: "Usuário não encontrado.",
            variant: "destructive"
          });
          return;
        }

        // Armazena o usuário no estado
        setUser(user);

        // Busca o perfil na tabela profiles
        // Usa maybeSingle() pois o perfil pode não existir
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('nome_completo, login')
          .eq('id', user.id)
          .maybeSingle();

        // Trata erro de busca
        if (error) {
          console.error("Erro ao buscar perfil:", error);
          throw error;
        }

        // Se encontrou perfil, usa os dados da tabela
        if (profileData) {
          setProfile(profileData);
        } else {
          // Fallback: usa metadados do usuário (definidos no cadastro)
          setProfile({
            nome_completo: user.user_metadata?.nome_completo || '',
            login: user.user_metadata?.login || ''
          });
        }
      } catch (error: any) {
        console.error("Erro ao carregar perfil:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do perfil.",
          variant: "destructive"
        });
      } finally {
        // Finaliza o carregamento
        setLoading(false);
      }
    };

    // Executa o carregamento
    loadProfile();
  }, [toast]);

  // ==========================================================================
  // RENDERIZAÇÃO - ESTADO DE CARREGAMENTO
  // ==========================================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ==========================================================================
  // RENDERIZAÇÃO - CONTEÚDO DO PERFIL
  // ==========================================================================
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-2xl mx-auto">
        {/* Card principal do perfil */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Meu Perfil</CardTitle>
            <CardDescription className="text-base">
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Campo: Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-semibold">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                value={profile?.nome_completo || ""}
                disabled
                className="h-12 text-base"
              />
            </div>

            {/* Campo: Login */}
            <div className="space-y-2">
              <Label htmlFor="login" className="text-sm font-semibold">Login</Label>
              <Input
                id="login"
                type="text"
                value={profile?.login || ""}
                disabled
                className="h-12 text-base"
              />
            </div>

            {/* Campo: Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="h-12 text-base"
              />
            </div>

            {/* Informação de data de criação */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Conta criada em: {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
