import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{
    nome_completo: string;
    login: string;
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Erro",
            description: "Usuário não encontrado.",
            variant: "destructive"
          });
          return;
        }

        setUser(user);

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('nome_completo, login')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar perfil:", error);
          throw error;
        }

        if (profileData) {
          setProfile(profileData);
        } else {
          // Se não houver perfil, usar dados do user metadata
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
        setLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Meu Perfil</CardTitle>
            <CardDescription className="text-base">
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
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
