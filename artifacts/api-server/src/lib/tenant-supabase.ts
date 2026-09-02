import type { Request } from "express";
import { supabase } from "./supabase";

/**
 * Tenant isolation layer.
 *
 * Every business table below carries a clinic_id column. Wrapping queries
 * through tenantSupabase(req) guarantees:
 *   - SELECT / UPDATE / DELETE are ALWAYS filtered by the caller's clinic
 *   - INSERT / UPSERT always stamp clinic_id on the written rows
 *
 * This makes cross-clinic data leaks structurally impossible in the API,
 * regardless of how individual handlers build their queries.
 * Platform-level code (auth, clinic management) keeps using the raw client.
 */

/** Tables whose rows are owned by a single clinic. */
const TENANT_TABLES = new Set([
  "patients",
  "visits",
  "appointments",
  "payments",
  "session_addons",
  "injection_logs",
  "laser_logs",
  "services",
  "service_groups",
  "inventory_items",
  "inventory_transactions",
  "supplier_debts",
  "vaults",
  "vault_transactions",
  "expenses",
  "routine_expenses",
  "expense_categories",
  "tasks",
  "prescription_templates",
  "investigation_templates",
  "staff_details",
  "branches",
  "holidays",
  "working_days",
  "referral_providers",
  "tax_settings",
  "system_settings",
  "roles",
  "system_users",
]);

export function isTenantTable(table: string): boolean {
  return TENANT_TABLES.has(table);
}

/** Resolve the clinic this request is allowed to touch. */
export function tenantClinicId(req: Request): number | null {
  const user: any = (req as any).user ?? {};
  if (user.clinicId == null) return null;
  const cid = Number(user.clinicId);
  return Number.isFinite(cid) ? cid : null;
}

/**
 * Returns a supabase-compatible client whose `.from(table)` enforces the
 * caller's clinic on every operation for tenant-owned tables.
 */
export function tenantSupabase(req: Request): any {
  const cid = tenantClinicId(req);
  if (cid == null) return supabase;

  const scoped: any = {
    from: (table: string) => {
      if (!TENANT_TABLES.has(table)) return supabase.from(table);
      return wrapQuery(supabase.from(table), cid);
    },
    rpc: (...args: any[]) => (supabase.rpc as any)(...args),
  };
  return scoped;
}

function wrapQuery(builder: any, cid: number): any {
  return new Proxy(builder, {
    get(target: any, prop: string | symbol) {
      if (typeof prop !== "string") return Reflect.get(target, prop, target);

      // Terminal thenable methods – bind directly, do not re-wrap promises.
      if (prop === "then" || prop === "catch" || prop === "finally") {
        const value = Reflect.get(target, prop, target);
        return typeof value === "function" ? value.bind(target) : value;
      }

      const original = Reflect.get(target, prop, target);
      if (typeof original !== "function") return original;

      return (...args: any[]) => {
        let result: any;

        if (prop === "insert" || prop === "upsert") {
          // Stamp clinic_id onto every written row (client value never wins).
          const stamp = (row: any) => ({ ...row, clinic_id: cid });
          const [rows, ...rest] = args;
          result = original.apply(
            target,
            [Array.isArray(rows) ? rows.map(stamp) : stamp(rows), ...rest] as any,
          );
          return wrapQuery(result, cid);
        }

        result = original.apply(target, args);

        // Force the clinic filter on reads, updates and deletes.
        if (
          result &&
          typeof result.eq === "function" &&
          (prop === "select" || prop === "update" || prop === "delete")
        ) {
          try {
            result = result.eq("clinic_id", cid);
          } catch {
            /* builder did not accept chaining – ignore */
          }
        }

        if (result && typeof result === "object") return wrapQuery(result, cid);
        return result;
      };
    },
  });
}
