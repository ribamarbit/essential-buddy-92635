import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
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
    nomeCompleto: "", login: "", email: "", password: "", confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) return { isValid: false, message: "A senha deve ter no mínimo 8 caracteres." };
    if (!/[A-Z]/.test(password)) return { isValid: false, message: "A senha deve conter pelo menos uma letra maiúscula." };
    if (!/[a-z]/.test(password)) return { isValid: false, message: "A senha deve conter pelo menos uma letra minúscula." };
    if (!/[0-9]/.test(password)) return { isValid: false, message: "A senha deve conter pelo menos um número." };
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { isValid: false, message: "A senha deve conter pelo menos um caractere especial." };
    return { isValid: true, message: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgotPassword) {
        if (!formData.email) { toast({ title: "Erro", description: "Por favor, insira seu email.", variant: "destructive" }); return; }
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, { redirectTo: `${window.location.origin}/` });
        if (error) throw error;
        toast({ title: "Email enviado! ✅", description: "Instruções para redefinir a senha foram enviadas para seu email." });
        setIsForgotPassword(false);
        return;
      }
      if (!formData.email || !formData.password) { toast({ title: "Erro", description: "Por favor, preencha todos os campos.", variant: "destructive" }); return; }
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
        if (error) throw error;
        toast({ title: "Login realizado com sucesso! ✅", description: "Bem-vindo de volta!" });
        setTimeout(() => onLogin(), 500);
      } else {
        if (!formData.nomeCompleto || !formData.login) { toast({ title: "Erro", description: "Por favor, preencha todos os campos.", variant: "destructive" }); return; }
        const pv = validatePassword(formData.password);
        if (!pv.isValid) { toast({ title: "Senha fraca", description: pv.message, variant: "destructive" }); return; }
        if (formData.password !== formData.confirmPassword) { toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" }); return; }
        const { error } = await supabase.auth.signUp({ email: formData.email, password: formData.password, options: { emailRedirectTo: `${window.location.origin}/`, data: { nome_completo: formData.nomeCompleto, login: formData.login } } });
        if (error) throw error;
        toast({ title: "Conta criada com sucesso! ✅", description: "Verifique seu email para confirmar sua conta antes de fazer login." });
        setIsLogin(true);
        resetForm();
      }
    } catch (error: unknown) {
      toast({ title: "Erro", description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nomeCompleto: "", login: "", email: "", password: "", confirmPassword: "" });
    setIsForgotPassword(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const createResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-demo-user`, { method: "POST", headers: { "Content-Type": "application/json" } });
      let email = "demo@concierge.com";
      let password = "Demo@123456";
      if (createResponse.ok) {
        const createData = await createResponse.json();
        if (createData.email) email = createData.email;
        if (createData.password) password = createData.password;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Login demo realizado! ✅", description: "Bem-vindo ao modo demonstração!" });
      setTimeout(() => onLogin(), 500);
    } catch {
      toast({ title: "Erro", description: "Usuário demo não disponível. Entre em contato com o suporte.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 overflow-x-hidden bg-gradient-to-br from-[#181a18] via-[#2c3d31] to-[#181a18]">
      <main className="relative z-10 w-full max-w-[480px]">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-primary-container p-3 rounded-full mb-4 shadow-xl shadow-primary/20">
            <span className="text-white text-3xl">🛒</span>
          </div>
          <h1 className="text-white font-headline font-extrabold text-2xl tracking-tighter drop-shadow-md">
            Concierge
          </h1>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-[2.5rem] p-10 md:p-12 shadow-2xl overflow-hidden relative border border-white/10">
          {/* Tonal decorations */}
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 mb-10 text-center">
            <h2 className="text-white font-headline font-bold text-3xl tracking-tight mb-2">
              {isForgotPassword ? "Recuperar Senha" : isLogin ? "Bem-vindo de volta" : "Criar Conta"}
            </h2>
            <p className="text-[#e5e2dd]/70 font-body text-sm">
              {isForgotPassword ? "Digite seu email para receber instruções" : isLogin ? "Acesse seu Concierge de Compras Orgânicas" : "Preencha os dados para criar sua conta"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Registration fields */}
            {!isLogin && !isForgotPassword && (
              <>
                <div className="space-y-2">
                  <label className="block text-[#e5e2dd] font-label text-xs uppercase tracking-widest ml-1">Nome Completo</label>
                  <input className="w-full bg-[#424843]/20 border border-white/5 rounded-xl py-4 px-4 text-white placeholder:text-[#e5e2dd]/40 focus:ring-2 focus:ring-primary-container transition-all" placeholder="Seu nome completo" value={formData.nomeCompleto} onChange={(e) => setFormData(prev => ({ ...prev, nomeCompleto: e.target.value }))} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <label className="block text-[#e5e2dd] font-label text-xs uppercase tracking-widest ml-1">Login</label>
                  <input className="w-full bg-[#424843]/20 border border-white/5 rounded-xl py-4 px-4 text-white placeholder:text-[#e5e2dd]/40 focus:ring-2 focus:ring-primary-container transition-all" placeholder="seu_usuario" value={formData.login} onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))} disabled={loading} />
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[#e5e2dd] font-label text-xs uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <input className="w-full bg-[#424843]/20 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#e5e2dd]/40 focus:ring-2 focus:ring-primary-container transition-all" type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} disabled={loading} />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e5e2dd]/60">✉</span>
              </div>
            </div>

            {/* Password */}
            {!isForgotPassword && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[#e5e2dd] font-label text-xs uppercase tracking-widest">Senha</label>
                  {isLogin && (
                    <button type="button" className="text-primary-fixed-dim font-label text-[10px] uppercase tracking-wider hover:text-white transition-colors" onClick={() => setIsForgotPassword(true)}>
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input className="w-full bg-[#424843]/20 border border-white/5 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-[#e5e2dd]/40 focus:ring-2 focus:ring-primary-container transition-all" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} disabled={loading} />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e5e2dd]/60">🔒</span>
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#e5e2dd]/60 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-[#e5e2dd]/40 mt-1">8+ caracteres, maiúsculas, minúsculas, números e especiais.</p>
                )}
              </div>
            )}

            {/* Confirm password */}
            {!isLogin && !isForgotPassword && (
              <div className="space-y-2">
                <label className="block text-[#e5e2dd] font-label text-xs uppercase tracking-widest ml-1">Confirmar Senha</label>
                <input className="w-full bg-[#424843]/20 border border-white/5 rounded-xl py-4 px-4 text-white placeholder:text-[#e5e2dd]/40 focus:ring-2 focus:ring-primary-container transition-all" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} disabled={loading} />
              </div>
            )}

            {/* Submit CTA */}
            <button type="submit" disabled={loading} className="w-full bg-primary-container hover:bg-primary text-white font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-50">
              {loading ? "Processando..." : isForgotPassword ? "Enviar instruções" : isLogin ? "Entrar" : "Criar Conta"}
            </button>

            {/* Divider + Demo */}
            {isLogin && !isForgotPassword && (
              <>
                <div className="flex items-center gap-4 py-4">
                  <div className="h-[1px] flex-1 bg-[#e5e2dd]/10" />
                  <span className="text-[#e5e2dd]/40 font-label text-[10px] uppercase tracking-widest font-bold">OU</span>
                  <div className="h-[1px] flex-1 bg-[#e5e2dd]/10" />
                </div>
                <button type="button" disabled={loading} onClick={handleDemoLogin} className="w-full bg-transparent border border-[#e5e2dd]/20 hover:bg-[#e5e2dd]/10 text-white font-headline font-semibold py-4 rounded-full transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  👤 Entrar como Demo
                </button>
              </>
            )}
          </form>

          {/* Footer links */}
          <div className="mt-10 text-center relative z-10">
            {isForgotPassword ? (
              <button className="text-primary-fixed-dim font-bold hover:underline text-sm" onClick={resetForm}>Voltar ao login</button>
            ) : (
              <p className="text-[#e5e2dd]/60 text-sm">
                {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                <button className="text-primary-fixed-dim font-bold hover:underline decoration-primary-fixed-dim/30 underline-offset-4 ml-1" onClick={() => { setIsLogin(!isLogin); resetForm(); }}>
                  {isLogin ? "Criar conta" : "Fazer login"}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Privacy */}
        <div className="mt-8 flex justify-center gap-8 opacity-60">
          <span className="text-white text-[10px] font-label uppercase tracking-widest">Termos de Uso</span>
          <span className="text-white text-[10px] font-label uppercase tracking-widest">Privacidade</span>
        </div>
      </main>
    </div>
  );
};

export default Login;
