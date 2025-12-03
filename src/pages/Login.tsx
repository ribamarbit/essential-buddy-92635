import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    login: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isForgotPassword) {
        if (!formData.email) {
          toast({
            title: "Erro",
            description: "Por favor, insira seu email.",
            variant: "destructive"
          });
          return;
        }
        
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

      if (!formData.email || !formData.password) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos.",
          variant: "destructive"
        });
        return;
      }

      // Login
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        toast({
          title: "Login realizado com sucesso! ✅",
          description: "Bem-vindo de volta!"
        });
        
        setTimeout(() => {
          onLogin();
        }, 500);
      } 
      // Cadastro
      else {
        // Validações para cadastro
        if (!formData.nomeCompleto || !formData.login) {
          toast({
            title: "Erro",
            description: "Por favor, preencha todos os campos.",
            variant: "destructive"
          });
          return;
        }

        // Validar senha forte
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          toast({
            title: "Senha fraca",
            description: passwordValidation.message,
            variant: "destructive"
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Erro",
            description: "As senhas não coincidem.",
            variant: "destructive"
          });
          return;
        }

        // Criar conta no Supabase
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
        
        // Resetar formulário e voltar para tela de login
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

  const resetForm = () => {
    setFormData({ nomeCompleto: "", login: "", email: "", password: "", confirmPassword: "" });
    setIsForgotPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      background: 'linear-gradient(to bottom right, #e0f2fe, #f0f9ff, #dbeafe)' 
    }}>
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{
            background: '#3b82f6'
          }}>
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            {isForgotPassword ? "Recuperar Senha" : isLogin ? "Bem-vindo de volta" : "Criar Conta"}
          </CardTitle>
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
            {!isLogin && !isForgotPassword && (
              <>
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
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">
                    A senha deve ter 8+ caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.
                  </p>
                )}
              </div>
            )}
            
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
            
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold rounded-xl mt-2"
              style={{ background: '#3b82f6' }}
              disabled={loading}
            >
              {loading ? "Processando..." : isForgotPassword ? "Enviar instruções" : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>
          
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
          
          {isLogin && !isForgotPassword && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium rounded-xl border-gray-300"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
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
          
          <div className="mt-6 space-y-4">
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