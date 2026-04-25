-- =====================================================
-- CONCIERGE B2B - Fundação LGPD-compliant
-- =====================================================

-- 1. Enum de papéis
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'inventory_manager',
  'buyer',
  'logistics_operator',
  'auditor'
);

-- 2. Tabela de operadores (espelho de auth.users)
CREATE TABLE public.app_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- 3. Papéis (separado de app_users)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Função has_role (SECURITY DEFINER evita recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 5. Trigger: cria app_user e role inicial ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_concierge_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.app_users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  ) ON CONFLICT (id) DO NOTHING;

  -- Papel padrão: operador logístico (menor privilégio)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'logistics_operator')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_concierge ON auth.users;
CREATE TRIGGER on_auth_user_created_concierge
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_concierge_user();

-- 6. Consentimentos LGPD
CREATE TABLE public.operator_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  accepted BOOLEAN NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  policy_version TEXT NOT NULL
);

ALTER TABLE public.operator_consents ENABLE ROW LEVEL SECURITY;

-- 7. Produtos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  minimum_shelf_life_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 8. Lotes
CREATE TABLE public.product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  batch_code TEXT NOT NULL,
  expiration_date DATE NOT NULL,
  supplier_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, batch_code)
);

ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;

-- 9. Estoque
CREATE TABLE public.inventory_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.product_batches(id),
  current_quantity NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
  minimum_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  location_code TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_balances ENABLE ROW LEVEL SECURITY;

-- 10. Movimentações
CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  batch_id UUID REFERENCES public.product_batches(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('sale','purchase','adjustment','loss','transfer')),
  quantity NUMERIC(12,3) NOT NULL,
  reason TEXT,
  performed_by UUID REFERENCES public.app_users(id),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- 11. Vendas PDV (já sanitizadas)
CREATE TABLE public.pos_sales_clean (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_transaction_id TEXT NOT NULL,
  store_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity NUMERIC(12,3) NOT NULL,
  total_value NUMERIC(12,2) NOT NULL,
  sold_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pos_sales_clean ENABLE ROW LEVEL SECURITY;

-- 12. Predições da IA
CREATE TABLE public.demand_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reference_date DATE NOT NULL DEFAULT CURRENT_DATE,
  suggested_quantity NUMERIC(12,3) NOT NULL,
  confidence_score NUMERIC(5,2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  model_version TEXT NOT NULL,
  explanation TEXT NOT NULL,
  is_safe_mode BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','edited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.demand_predictions ENABLE ROW LEVEL SECURITY;

-- 13. Decisões humanas
CREATE TABLE public.ai_suggestion_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES public.demand_predictions(id) ON DELETE CASCADE,
  decided_by UUID NOT NULL REFERENCES public.app_users(id),
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected','edited')),
  final_quantity NUMERIC(12,3),
  human_reason TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_suggestion_decisions ENABLE ROW LEVEL SECURITY;

-- 14. Logs de auditoria
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES public.app_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  readable_description TEXT NOT NULL,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

-- app_users
CREATE POLICY "Users can view own profile" ON public.app_users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all users" ON public.app_users
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.app_users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage users" ON public.app_users
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- operator_consents
CREATE POLICY "Users see own consents" ON public.operator_consents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own consents" ON public.operator_consents
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all consents" ON public.operator_consents
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- products (todos autenticados leem; admin/gerente gerenciam)
CREATE POLICY "Authenticated read products" ON public.products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/manager manage products" ON public.products
  FOR ALL USING (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'inventory_manager')
  );

-- product_batches
CREATE POLICY "Authenticated read batches" ON public.product_batches
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager manage batches" ON public.product_batches
  FOR ALL USING (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'inventory_manager')
  );

-- inventory_balances
CREATE POLICY "Authenticated read inventory" ON public.inventory_balances
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators adjust inventory" ON public.inventory_balances
  FOR ALL USING (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'inventory_manager') OR
    public.has_role(auth.uid(),'logistics_operator')
  );

-- inventory_movements
CREATE POLICY "Authenticated read movements" ON public.inventory_movements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators insert movements" ON public.inventory_movements
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'inventory_manager') OR
    public.has_role(auth.uid(),'logistics_operator')
  );

-- pos_sales_clean (somente sistema/admin escreve, todos leem)
CREATE POLICY "Authenticated read sales" ON public.pos_sales_clean
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage sales" ON public.pos_sales_clean
  FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- demand_predictions
CREATE POLICY "Authenticated read predictions" ON public.demand_predictions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager/buyer manage predictions" ON public.demand_predictions
  FOR ALL USING (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'inventory_manager') OR
    public.has_role(auth.uid(),'buyer')
  );

-- ai_suggestion_decisions
CREATE POLICY "Authenticated read decisions" ON public.ai_suggestion_decisions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Buyer/manager record decisions" ON public.ai_suggestion_decisions
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'inventory_manager') OR
    public.has_role(auth.uid(),'buyer')
  );

-- audit_logs (apenas admin/auditor leem; sistema escreve)
CREATE POLICY "Admin/auditor read logs" ON public.audit_logs
  FOR SELECT USING (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'auditor')
  );
CREATE POLICY "Authenticated write logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_user_id);

-- Índices úteis
CREATE INDEX idx_inventory_product ON public.inventory_balances(product_id);
CREATE INDEX idx_movements_product ON public.inventory_movements(product_id, occurred_at DESC);
CREATE INDEX idx_sales_product_date ON public.pos_sales_clean(product_id, sold_at DESC);
CREATE INDEX idx_predictions_status ON public.demand_predictions(status, created_at DESC);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);