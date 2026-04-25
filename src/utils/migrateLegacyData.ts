/**
 * Migra itens essenciais do localStorage (modelo doméstico antigo)
 * para a tabela `products` + `inventory_balances` (B2B).
 * Executa apenas uma vez por usuário.
 */
import { supabase } from "@/integrations/supabase/client";

const FLAG = "concierge_b2b_migrated_v1";

export async function migrateLocalItemsToProducts() {
  if (localStorage.getItem(FLAG)) return { migrated: 0, skipped: true };

  const stored = localStorage.getItem("dashboardEssentials");
  if (!stored) {
    localStorage.setItem(FLAG, "true");
    return { migrated: 0, skipped: false };
  }

  let items: any[] = [];
  try { items = JSON.parse(stored); } catch { items = []; }

  let migrated = 0;
  for (const item of items) {
    const sku = `LEG-${(item.id ?? Date.now()).toString().slice(-8).padStart(8, "0")}`;
    const category = item.category || "Geral";

    const { data: existing } = await supabase.from("products").select("id").eq("sku", sku).maybeSingle();
    let productId = existing?.id;

    if (!productId) {
      const { data: ins } = await supabase.from("products").insert({
        sku, name: item.name ?? "Item migrado", category, minimum_shelf_life_days: 7
      }).select("id").single();
      productId = ins?.id;
    }

    if (productId) {
      const { data: invExists } = await supabase.from("inventory_balances")
        .select("id").eq("product_id", productId).maybeSingle();
      if (!invExists) {
        await supabase.from("inventory_balances").insert({
          product_id: productId,
          current_quantity: Math.max(1, Math.round((item.totalDays ?? 30) / 3)),
          minimum_stock: 5,
          location_code: "A1"
        });
      }
      migrated++;
    }
  }

  localStorage.setItem(FLAG, "true");
  return { migrated, skipped: false };
}
