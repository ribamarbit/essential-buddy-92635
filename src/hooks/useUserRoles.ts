import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "inventory_manager" | "buyer" | "logistics_operator" | "auditor";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  inventory_manager: "Gerente de Estoque",
  buyer: "Comprador",
  logistics_operator: "Operador Logístico",
  auditor: "Auditor",
};

export function useUserRoles() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (active) { setRoles([]); setLoading(false); } return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (active) {
        setRoles((data ?? []).map(r => r.role as AppRole));
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const has = (r: AppRole) => roles.includes(r);
  const canManageProducts = has("admin") || has("inventory_manager");
  const canApprovePurchase = has("admin") || has("inventory_manager") || has("buyer");
  const canAdjustInventory = has("admin") || has("inventory_manager") || has("logistics_operator");
  const canViewAuditLogs = has("admin") || has("auditor");
  const canHardDelete = has("admin");

  return { roles, loading, has, canManageProducts, canApprovePurchase, canAdjustInventory, canViewAuditLogs, canHardDelete };
}
