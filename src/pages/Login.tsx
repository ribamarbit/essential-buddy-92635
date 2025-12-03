/**
 * =============================================================================
 * LOGIN.TSX - Página de Autenticação
 * =============================================================================
 * 
 * Página responsável pela autenticação de usuários na aplicação.
 * Funcionalidades:
 * - Login com email e senha
 * - Cadastro de novos usuários
 * - Recuperação de senha
 * - Acesso com usuário demo
 * - Validação de senha forte
 * 
 * Integração: Supabase Auth
 * 
 * =============================================================================
 */

import { useState } from "react";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Hook de notificações
import { useToast } from "@/hooks/use-toast";

// Ícones
import { Eye, EyeOff, ShoppingCart } from "lucide-react";

// Cliente Supabase para autenticação
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface de Props do componente Login
 */
interface LoginProps {
  onLogin: () => void;  // Callback executado após login bem-sucedido
}

/**
 * Componente de Login
 * 
 * Renderiza um formulário adaptativo que pode exibir:
 * - Tela de login
 * - Tela de cadastro
 * - Tela de recuperação de senha
 */
const Login = ({ onLogin }: LoginProps) => {
  const { toast } = useToast();
  
  // ============================================================================
  // ESTADOS DO COMPONENTE
  // ============================================================================
  
  // Controla visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);
  
  // Controla se está na tela de login (true) ou cadastro (false)
  const [isLogin, setIsLogin] = useState(true);
  
  // Controla se está na tela de recuperação de senha
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    nomeCompleto: "",    // Usado apenas no cadastro
    login: "",           // Nome de usuário (usado apenas no cadastro)
    email: "",           // Email do usuário
    password: "",        // Senha
    confirmPassword: ""  // Confirmação de senha (usado apenas no cadastro)
  });
  
  // Estado de loading durante operações assíncronas
  const [loading, setLoading] = useState(false);

  /**
   * Valida se a senha atende aos requisitos de segurança
   * 
   * Requisitos:
   * - Mínimo 8 caracteres
   * - Pelo menos uma letra maiúscula
   * - Pelo menos uma letra minúscula
   * - Pelo menos um número
   * - Pelo menos um caractere especial
   * 
   * @param password - Senha a ser validada
   * @returns Objeto com isValid (boolean) e message (string de erro)
   */
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: "A senha deve ter no mínimo 8 caracteres." };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: "A senha deve conter pelo menos uma letra maiúscula." };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: "A senha deve conter pelo menos uma letra minúscula." };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: "A senha deve conter pelo menos um número." };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: "A senha deve conter pelo menos um caractere especial." };
    }
    return { isValid: true, message: "" };
  };

  /**
   * Handler de submissão do formulário
   * 
   * Comportamento varia de acordo com o estado atual:
   * - isForgotPassword: Envia email de recuperação
   * - isLogin: Faz login com email/senha
   * - !isLogin: Cria nova conta
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ========================================================================
      // RECUPERAÇÃO DE SENHA
      // ========================================================================
      if (isForgotPassword) {
        if (!formData.email) {
          toast({
            title: "Erro",
            description: "Por favor, insira seu email.",
            variant: "destructive"
          });
          return;
        }
        
        // Envia email de recuperação via Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/`
        });

        if (error) throw error;
        
        toast({
          title: "Email enviado! ✅",
          description: "Instruções para redefinir a senha foram enviadas para seu email."
        });
        setIsForgotPassword(false);
        return;
      }

      // Validação básica de campos obrigatórios
      if (!formData.email || !formData.password) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos.",
          variant: "destructive"
        });
        return;
      }

      // ========================================================================
      // LOGIN
      // ========================================================================
      if (isLogin) {
        // Tenta fazer login com Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        toast({
          title: "Login realizado com sucesso! ✅",
          description: "Bem-vindo de volta!"
        });
        
        // Delay para mostrar toast antes de redirecionar
        setTimeout(() => {
          onLogin();
        }, 500);
      } 
      // ========================================================================
      // CADASTRO
      // ========================================================================
      else {
        // Validações específicas para cadastro
        if (!formData.nomeCompleto || !formData.login) {
          toast({
            title: "Erro",
            description: "Por favor, preencha todos os campos.",
            variant: "destructive"
          });
          return;
        }

        // Valida requisitos de senha forte
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          toast({
            title: "Senha fraca",
            description: passwordValidation.message,
            variant: "destructive"
          });
          return;
        }

        // Verifica se as senhas coincidem
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Erro",
            description: "As senhas não coincidem.",
            variant: "destructive"
          });
          return;
        }

        // Cria conta no Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              nome_completo: formData.nomeCompleto,
              login: formData.login
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Conta criada com sucesso! ✅",
          description: "Verifique seu email para confirmar sua conta antes de fazer login."
        });
        
        // Volta para tela de login após cadastro
        setIsLogin(true);
        resetForm();
      }
    } catch (error: any) {
      console.error("Erro na autenticação:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reseta todos os campos do formulário
   */
  const resetForm = () => {
    setFormData({ nomeCompleto: "", login: "", email: "", password: "", confirmPassword: "" });
    setIsForgotPassword(false);
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      background: 'linear-gradient(to bottom right, #e0f2fe, #f0f9ff, #dbeafe)' 
    }}>
      <Card className="w-full max-w-md shadow-xl border-0">
        {/* Header do Card com Logo e Título */}
        <CardHeader className="space-y-1 text-center pt-8">
          {/* Ícone do carrinho de compras */}
          <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{
            background: '#3b82f6'
          }}>
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>
          
          {/* Título dinâmico baseado no estado */}
          <CardTitle className="text-3xl font-bold text-gray-900">
            {isForgotPassword ? "Recuperar Senha" : isLogin ? "Bem-vindo de volta" : "Criar Conta"}
          </CardTitle>
          
          {/* Descrição dinâmica baseada no estado */}
          <CardDescription className="text-base text-gray-600 pt-2">
            {isForgotPassword
              ? "Digite seu email para receber instruções de recuperação"
              : isLogin
              ? "Faça login para acessar o Concierge de Compras"
              : "Preencha os dados para criar sua conta"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* ================================================================
                CAMPOS DE CADASTRO (visíveis apenas no modo cadastro)
                ================================================================ */}
            {!isLogin && !isForgotPassword && (
              <>
                {/* Campo: Nome Completo */}
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto" className="text-sm font-semibold text-gray-700">Nome Completo</Label>
                  <Input
                    id="nomeCompleto"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.nomeCompleto}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomeCompleto: e.target.value }))}
                    className="h-12 text-base rounded-xl border-gray-200"
                    disabled={loading}
                  />
                </div>
                
                {/* Campo: Login (nome de usuário) */}
                <div className="space-y-2">
                  <Label htmlFor="login" className="text-sm font-semibold text-gray-700">Login (nome de usuário)</Label>
                  <Input
                    id="login"
                    type="text"
                    placeholder="seu_usuario"
                    value={formData.login}
                    onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
                    className="h-12 text-base rounded-xl border-gray-200"
                    disabled={loading}
                  />
                </div>
              </>
            )}
            
            {/* ================================================================
                CAMPO EMAIL (sempre visível)
                ================================================================ */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-12 text-base rounded-xl border-gray-200"
                disabled={loading}
              />
            </div>
            
            {/* ================================================================
                CAMPO SENHA (visível exceto em recuperação)
                ================================================================ */}
            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="h-12 text-base rounded-xl border-gray-200"
                    disabled={loading}
                  />
                  {/* Botão para mostrar/ocultar senha */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                </div>
                {/* Dica de requisitos de senha (apenas no cadastro) */}
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">
                    A senha deve ter 8+ caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.
                  </p>
                )}
              </div>
            )}
            
            {/* ================================================================
                CAMPO CONFIRMAR SENHA (apenas no cadastro)
                ================================================================ */}
            {!isLogin && !isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="h-12 text-base rounded-xl border-gray-200"
                  disabled={loading}
                />
              </div>
            )}
            
            {/* Botão de Submissão */}
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold rounded-xl mt-2"
              style={{ background: '#3b82f6' }}
              disabled={loading}
            >
              {loading ? "Processando..." : isForgotPassword ? "Enviar instruções" : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>
          
          {/* ================================================================
              SEPARADOR "OU" (apenas no login)
              ================================================================ */}
          {isLogin && !isForgotPassword && (
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </div>
          )}
          
          {/* ================================================================
              BOTÃO DE LOGIN DEMO
              Permite acesso rápido com usuário de demonstração
              ================================================================ */}
          {isLogin && !isForgotPassword && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium rounded-xl border-gray-300"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  // Credenciais do usuário demo
                  const { error } = await supabase.auth.signInWithPassword({
                    email: "demo@concierge.com",
                    password: "Demo@123456"
                  });
                  if (error) throw error;
                  toast({
                    title: "Login demo realizado! ✅",
                    description: "Bem-vindo ao modo demonstração!"
                  });
                  setTimeout(() => onLogin(), 500);
                } catch (error: any) {
                  toast({
                    title: "Erro",
                    description: "Usuário demo não disponível. Entre em contato com o suporte.",
                    variant: "destructive"
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              Entrar como Demo
            </Button>
          )}
          
          {/* ================================================================
              LINKS DE NAVEGAÇÃO ENTRE MODOS
              ================================================================ */}
          <div className="mt-6 space-y-4">
            {/* Link: Esqueci minha senha */}
            {isLogin && !isForgotPassword && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm font-medium hover:underline p-0 h-auto"
                  style={{ color: '#3b82f6' }}
                  onClick={() => setIsForgotPassword(true)}
                >
                  Esqueci minha senha
                </Button>
              </div>
            )}
            
            {/* Link: Voltar ao login (da recuperação de senha) */}
            {isForgotPassword ? (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm font-medium p-0 h-auto"
                  style={{ color: '#3b82f6' }}
                  onClick={resetForm}
                >
                  Voltar ao login
                </Button>
              </div>
            ) : (
              /* Links: Alternar entre login e cadastro */
              <div className="text-center text-sm text-gray-600">
                {isLogin ? (
                  <>
                    Não tem uma conta?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto font-semibold hover:underline"
                      style={{ color: '#3b82f6' }}
                      onClick={() => {
                        setIsLogin(false);
                        resetForm();
                      }}
                    >
                      Criar conta
                    </Button>
                  </>
                ) : (
                  <>
                    Já tem uma conta?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto font-semibold hover:underline"
                      style={{ color: '#3b82f6' }}
                      onClick={() => {
                        setIsLogin(true);
                        resetForm();
                      }}
                    >
                      Fazer login
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
