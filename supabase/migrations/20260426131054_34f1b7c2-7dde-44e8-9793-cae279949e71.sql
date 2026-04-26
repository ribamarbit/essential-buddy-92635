CREATE OR REPLACE FUNCTION public._sanitize_cpf(_cpf TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_catalog
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