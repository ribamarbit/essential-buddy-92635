import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ShoppingCart } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgotPassword) {
      if (!formData.email) {
        toast({
          title: "Erro",
          description: "Por favor, insira seu email.",
          variant: "destructive"
        });
        return;
      }
      
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

    // Validar senha forte ao criar conta
    if (!isLogin) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        toast({
          title: "Senha fraca",
          description: passwordValidation.message,
          variant: "destructive"
        });
        return;
      }
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    // Simular validação de login
    if (isLogin && (formData.email !== "user@test.com" || formData.password !== "123456")) {
      toast({
        title: "Erro",
        description: "Login e/ou senha errados",
        variant: "destructive"
      });
      return;
    }

    // Mensagem diferente para criação de conta incluindo confirmação por e-mail
    if (!isLogin) {
      toast({
        title: "Conta criada com sucesso! ✅",
        description: "Um e-mail de confirmação foi enviado para " + formData.email
      });
    } else {
      toast({
        title: "Login realizado com sucesso! ✅",
        description: "Bem-vindo de volta!"
      });
    }
    
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  const resetForm = () => {
    setFormData({ email: "", password: "", confirmPassword: "" });
    setIsForgotPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-success/5 p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-card">
            <ShoppingCart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {isForgotPassword 
                ? "Esqueci minha senha" 
                : isLogin 
                  ? "Bem-vindo de volta" 
                  : "Criar conta"
              }
            </CardTitle>
            <CardDescription>
              {isForgotPassword 
                ? "Digite seu email para redefinir a senha"
                : isLogin 
                  ? "Faça login para acessar o Concierge de Compras" 
                  : "Crie sua conta no Concierge de Compras"
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="transition-all focus:shadow-card"
              />
            </div>
            
            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pr-10 transition-all focus:shadow-card"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    A senha deve ter 8+ caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.
                  </p>
                )}
              </div>
            )}
            
            {!isLogin && !isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="transition-all focus:shadow-card"
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 transition-all shadow-card hover:shadow-elevated"
            >
              {isForgotPassword 
                ? "Enviar email" 
                : isLogin 
                  ? "Entrar" 
                  : "Criar conta"
              }
            </Button>
          </form>
          
          <div className="mt-6 space-y-3 text-center text-sm">
            {!isForgotPassword && (
              <>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-muted-foreground hover:text-primary"
                >
                  Esqueci minha senha
                </Button>
                
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-muted-foreground">
                    {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      resetForm();
                    }}
                    className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                  >
                    {isLogin ? "Criar conta" : "Fazer login"}
                  </Button>
                </div>
              </>
            )}
            
            {isForgotPassword && (
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsForgotPassword(false);
                  resetForm();
                }}
                className="text-muted-foreground hover:text-primary"
              >
                Voltar ao login
              </Button>
            )}
          </div>
          
          {isLogin && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground text-center">
              <strong>Demo:</strong> user@test.com / 123456
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;