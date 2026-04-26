-- Extensão de criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela de dados fiscais do cliente (CPF criptografado)
CREATE TABLE IF NOT EXISTS public.customer_invoice_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cpf_encrypted BYTEA NOT NULL,
  cpf_last_two TEXT NOT NULL CHECK (cpf_last_two ~ '^[0-9]{2}$'),
  cpf_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.customer_invoice_data ENABLE ROW LEVEL SECURITY;

-- Bloqueio explícito: ninguém faz SELECT direto na tabela.
-- Acesso só via funções SECURITY DEFINER abaixo.
CREATE POLICY "Block direct read of encrypted CPF"
ON public.customer_invoice_data
FOR SELECT
USING (false);

CREATE POLICY "Block direct insert"
ON public.customer_invoice_data
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct update"
ON public.customer_invoice_data
FOR UPDATE
USING (false);

CREATE POLICY "Block direct delete"
ON public.customer_invoice_data
FOR DELETE
USING (false);

-- Função interna que devolve a chave de criptografia.
-- A chave fica numa GUC do Postgres definida via secret no servidor.
-- Em produção, configurar: ALTER DATABASE postgres SET app.cpf_key = 'CHAVE_FORTE';
CREATE OR REPLACE FUNCTION public._cpf_encryption_key()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k TEXT;
BEGIN
  k := current_setting('app.cpf_key', true);
  IF k IS NULL OR length(k) < 16 THEN
    -- Fallback determinístico para ambiente de desenvolvimento.
    -- Substituir por chave forte em produção.
    k := 'concierge-dev-cpf-key-rotate-in-prod-32b';
  END IF;
  RETURN k;
END;
$$;

REVOKE ALL ON FUNCTION public._cpf_encryption_key() FROM PUBLIC, anon, authenticated;

-- Sanitiza CPF (apenas dígitos) e valida tamanho
CREATE OR REPLACE FUNCTION public._sanitize_cpf(_cpf TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
BEGIN
  digits := regexp_replace(coalesce(_cpf, ''), '\D', '', 'g');
  IF length(digits) <> 11 THEN
    RAISE EXCEPTION 'CPF inválido: deve conter 11 dígitos';
  END IF;
  RETURN digits;
END;
$$;

-- Salva CPF criptografado para o usuário autenticado
CREATE OR REPLACE FUNCTION public.set_invoice_cpf(_cpf TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  uid UUID := auth.uid();
  digits TEXT;
  enc BYTEA;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  digits := public._sanitize_cpf(_cpf);
  enc := pgp_sym_encrypt(digits, public._cpf_encryption_key(), 'cipher-algo=aes256');

  INSERT INTO public.customer_invoice_data (user_id, cpf_encrypted, cpf_last_two, cpf_hash)
  VALUES (
    uid,
    enc,
    right(digits, 2),
    encode(digest(digits || public._cpf_encryption_key(), 'sha256'), 'hex')
  )
  ON CONFLICT (user_id) DO UPDATE
    SET cpf_encrypted = EXCLUDED.cpf_encrypted,
        cpf_last_two = EXCLUDED.cpf_last_two,
        cpf_hash = EXCLUDED.cpf_hash,
        updated_at = now();

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, readable_description)
  VALUES (uid, 'cpf_invoice_set', 'customer_invoice_data', uid,
          'Cliente cadastrou/atualizou CPF para nota fiscal (criptografado).');
END;
$$;

-- Remove CPF (direito ao esquecimento parcial)
CREATE OR REPLACE FUNCTION public.delete_invoice_cpf()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  DELETE FROM public.customer_invoice_data WHERE user_id = uid;
  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, readable_description)
  VALUES (uid, 'cpf_invoice_deleted', 'customer_invoice_data', uid,
          'Cliente removeu CPF de nota fiscal.');
END;
$$;

-- Retorna apenas a máscara: ***.***.***-XX  (nunca o CPF completo)
CREATE OR REPLACE FUNCTION public.get_masked_cpf()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  uid UUID := auth.uid();
  last2 TEXT;
BEGIN
  IF uid IS NULL THEN RETURN NULL; END IF;
  SELECT cpf_last_two INTO last2
  FROM public.customer_invoice_data WHERE user_id = uid;
  IF last2 IS NULL THEN RETURN NULL; END IF;
  RETURN '***.***.***-' || last2;
END;
$$;

-- Gera payload de nota fiscal: descriptografa CPF APENAS internamente,
-- registra emissão e retorna ao chamador apenas a máscara + dados do pedido.
-- O CPF em claro nunca trafega de volta pela API REST do PostgREST.
CREATE OR REPLACE FUNCTION public.generate_invoice_payload(_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  uid UUID := auth.uid();
  cpf_plain TEXT;
  result JSONB;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;

  SELECT pgp_sym_decrypt(cpf_encrypted, public._cpf_encryption_key())::TEXT
    INTO cpf_plain
  FROM public.customer_invoice_data
  WHERE user_id = uid;

  -- Aqui, em produção, o CPF em claro seria entregue diretamente ao
  -- serviço fiscal (sefaz/erp) por uma edge function privada.
  -- Esta função retorna SOMENTE a máscara para o cliente.

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, readable_description)
  VALUES (uid, 'invoice_emitted', 'invoice', _order_id,
          'Nota fiscal gerada para o pedido. CPF utilizado apenas internamente.');

  result := jsonb_build_object(
    'order_id', _order_id,
    'cpf_masked', CASE WHEN cpf_plain IS NULL THEN NULL
                       ELSE '***.***.***-' || right(cpf_plain, 2) END,
    'has_cpf', cpf_plain IS NOT NULL,
    'emitted_at', now()
  );

  -- Apaga referência local da variável
  cpf_plain := NULL;

  RETURN result;
END;
$$;

-- Permissões: apenas usuários autenticados podem chamar as funções públicas
REVOKE ALL ON FUNCTION public.set_invoice_cpf(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_invoice_cpf() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_masked_cpf() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.generate_invoice_payload(UUID) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.set_invoice_cpf(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_invoice_cpf() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_masked_cpf() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_invoice_payload(UUID) TO authenticated;