-- Adiciona política DELETE para permitir que usuários deletem seu próprio perfil (GDPR compliance)
CREATE POLICY "Usuários podem deletar seu próprio perfil"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);