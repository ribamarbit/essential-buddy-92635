-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  login TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Políticas para inserção serão feitas via trigger, então permitimos inserção apenas do próprio perfil
CREATE POLICY "Usuários podem criar seu próprio perfil"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Criar função para popular a tabela profiles automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, login)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome_completo', ''),
    COALESCE(new.raw_user_meta_data->>'login', '')
  );
  RETURN new;
END;
$$;

-- Criar trigger que dispara quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();