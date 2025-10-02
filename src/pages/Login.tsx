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
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-12 text-base rounded-xl border-gray-200"
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
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold rounded-xl mt-2"
              style={{ background: '#3b82f6' }}
            >
              {isForgotPassword ? "Enviar instruções" : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>
          
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
          
          {isLogin && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#eff6ff' }}>
              <p className="text-xs text-center" style={{ color: '#1e40af' }}>
                💡 <strong>Demo:</strong> user@test.com / 123456
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;