import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../lib/supabase";
import { invalidateClinicStatus, invalidateUserStatus } from "../lib/clinic-status";
import { insertClinicSchema } from "@workspace/db/schema";
import { superadminMiddleware, tenantMiddleware, TenantRequest } from "../middlewares/tenant";

const router = Router();

// Protect all clinic routes with tenant and superadmin middleware
router.use("/clinics", tenantMiddleware, superadminMiddleware);

// Map camelCase (app convention) <-> snake_case (DB columns)
const CAMEL_TO_SNAKE: Record<string, string> = {
  nameEn: "name_en",
  logoUrl: "logo_url",
  subscriptionPlan: "subscription_plan",
  isActive: "is_active",
  maxUsers: "max_users",
  maxBranches: "max_branches",
  createdAt: "created_at",
  updatedAt: "updated_at",
};
const SNAKE_TO_CAMEL: Record<string, string> = Object.fromEntries(
  Object.entries(CAMEL_TO_SNAKE).map(([c, s]) => [s, c]),
);

function toSnake<T extends Record<string, any>>(obj: T): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [CAMEL_TO_SNAKE[k] ?? k, v]),
  );
}

function toCamel<T extends Record<string, any>>(row: T): Record<string, any> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [SNAKE_TO_CAMEL[k] ?? k, v]),
  );
}

// Get all clinics (with number of accounts per clinic)
router.get("/clinics", async (req: TenantRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("clinics")
      .select("*, system_users(count)")
      .order("created_at");

    if (error) {
      req.log.error({ err: error }, "Failed to fetch clinics");
      return res.status(500).json({ error: error.message });
    }

    const clinics = ((data as any[]) || []).map((c) => {
      const { system_users, ...rest } = c;
      return { ...toCamel(rest), usersCount: system_users?.[0]?.count ?? 0 };
    });

    res.json(clinics);
  } catch (err: any) {
    req.log.error({ err }, "Failed to fetch clinics");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new clinic
router.post("/clinics", async (req: TenantRequest, res: Response) => {
  try {
    const parsed = insertClinicSchema.parse(req.body);

    const { data, error } = await supabase
      .from("clinics")
      .insert(toSnake(parsed))
      .select()
      .single();

    if (error) {
      const msg = error.message.includes("duplicate key")
        ? "الرابط (slug) مستخدم مسبقاً لعيادة أخرى"
        : error.message;
      req.log.error({ err: error }, "Failed to create clinic");
      return res.status(400).json({ error: msg });
    }

    res.status(201).json(toCamel(data));
  } catch (err: any) {
    req.log.error({ err }, "Failed to create clinic");
    res.status(400).json({ error: err.message || "Invalid payload" });
  }
});

// Update clinic
router.put("/clinics/:id", async (req: TenantRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid clinic id" });
    }

    const parsed = insertClinicSchema.partial().parse(req.body);

    const { data, error } = await supabase
      .from("clinics")
      .update({ ...toSnake(parsed), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      req.log.error({ err: error }, "Failed to update clinic");
      return res.status(404).json({ error: "Clinic not found" });
    }

    // Suspension toggle must take effect immediately – drop the cached status.
    if ((parsed as any).isActive !== undefined) {
      invalidateClinicStatus(id);
    }

    res.json(toCamel(data));
  } catch (err: any) {
    req.log.error({ err }, "Failed to update clinic");
    res.status(400).json({ error: err.message || "Invalid payload" });
  }
});

// Get all accounts (users) of a clinic – full details, without password hashes
router.get("/clinics/:id/accounts", async (req: TenantRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid clinic id" });
    }

    const [{ data: users, error }, { data: roles }] = await Promise.all([
      supabase
        .from("system_users")
        .select("id,name,username,email,role_id,branch,is_frozen,is_superadmin,created_at")
        .eq("clinic_id", id)
        .order("created_at"),
      supabase.from("roles").select("id,name"),
    ]);

    if (error) {
      req.log.error({ err: error }, "Failed to fetch clinic accounts");
      return res.status(500).json({ error: error.message });
    }

    const roleNameById = new Map<number, string>(
      ((roles as any[]) || []).map((r) => [r.id, r.name]),
    );

    const accounts = ((users as any[]) || []).map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      branch: u.branch,
      isFrozen: u.is_frozen,
      isSuperadmin: u.is_superadmin,
      createdAt: u.created_at,
      roleName: roleNameById.get(u.role_id) || "—",
    }));

    res.json(accounts);
  } catch (err: any) {
    req.log.error({ err }, "Failed to fetch clinic accounts");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a NEW account for a specific clinic
const ALLOWED_ROLE_NAMES = new Set(["admin", "doctor", "receptionist"]);

router.post("/clinics/:id/accounts", async (req: TenantRequest, res: Response) => {
  try {
    const clinicId = parseInt(req.params.id);
    if (Number.isNaN(clinicId)) {
      return res.status(400).json({ error: "Invalid clinic id" });
    }

    const name = String(req.body?.name ?? "").trim();
    const username = String(req.body?.username ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const role = String(req.body?.role ?? "").trim().toLowerCase();
    const email = req.body?.email ? String(req.body.email).trim() : null;
    const branch = req.body?.branch ? String(req.body.branch).trim() : null;

    if (name.length < 2) {
      return res.status(400).json({ error: "الرجاء إدخال اسم الحساب (حرفان على الأقل)" });
    }
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      return res.status(400).json({
        error: "اسم المستخدم يجب أن يكون بالإنجليزية (3-32 حرفاً: أحرف صغيرة، أرقام، نقطة، شرطة سفلية أو عادية)",
      });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" });
    }
    if (!ALLOWED_ROLE_NAMES.has(role)) {
      return res.status(400).json({ error: "الصلاحية يجب أن تكون: اداري، طبيب، أو موظف استقبال" });
    }

    // Clinic must exist – also used for the max-users limit
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id,max_users")
      .eq("id", clinicId)
      .single();

    if (clinicError || !clinic) {
      return res.status(404).json({ error: "العيادة غير موجودة" });
    }

    // Enforce the subscription accounts limit
    if (clinic.max_users != null) {
      const { count } = await supabase
        .from("system_users")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId);

      if ((count ?? 0) >= Number(clinic.max_users)) {
        return res.status(400).json({
          error: `تم الوصول للحد الأقصى للحسابات (${clinic.max_users}). قم برفع حد الحسابات من بيانات العيادة لإضافة المزيد.`,
        });
      }
    }

    // Resolve role name -> id
    const { data: roleRow, error: roleError } = await supabase
      .from("roles")
      .select("id,name")
      .eq("name", role)
      .limit(1)
      .maybeSingle();

    if (roleError || !roleRow) {
      return res.status(400).json({ error: "الصلاحية المطلوبة غير موجودة في النظام" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("system_users")
      .insert({
        clinic_id: clinicId,
        name,
        username,
        password_hash: passwordHash,
        role_id: roleRow.id,
        email,
        branch,
      })
      .select("id,name,username,email,role_id,branch,is_frozen,is_superadmin,created_at")
      .single();

    if (error) {
      const msg = error.message.includes("duplicate key")
        ? "اسم المستخدم مستخدم مسبقاً، اختر اسماً آخر"
        : error.message;
      req.log.error({ err: error }, "Failed to create clinic account");
      return res.status(400).json({ error: msg });
    }

    req.log.info({ clinicId, accountId: data.id }, "Superadmin created clinic account");
    res.status(201).json({
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      branch: data.branch,
      isFrozen: data.is_frozen,
      isSuperadmin: data.is_superadmin,
      createdAt: data.created_at,
      roleName: roleRow.name,
    });
  } catch (err: any) {
    req.log.error({ err }, "Failed to create clinic account");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Set a NEW password for a specific account of a clinic
router.post("/clinics/:id/accounts/:accountId/password", async (req: TenantRequest, res: Response) => {
  try {
    const clinicId = parseInt(req.params.id);
    const accountId = parseInt(req.params.accountId);
    if (Number.isNaN(clinicId) || Number.isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid ids" });
    }

    const newPassword = String(req.body?.newPassword ?? "");
    if (newPassword.length < 4) {
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from("system_users")
      .update({ password_hash: passwordHash })
      .eq("id", accountId)
      .eq("clinic_id", clinicId)
      .select("id,username,name")
      .single();

    if (error || !data) {
      req.log.error({ err: error }, "Failed to reset account password");
      return res.status(404).json({ error: "الحساب غير موجود في هذه العيادة" });
    }

    req.log.info({ accountId, clinicId }, "Superadmin reset account password");
    res.json({ success: true });
  } catch (err: any) {
    req.log.error({ err }, "Failed to reset account password");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Freeze / unfreeze a specific account of a clinic
router.post("/clinics/:id/accounts/:accountId/frozen", async (req: TenantRequest, res: Response) => {
  try {
    const clinicId = parseInt(req.params.id);
    const accountId = parseInt(req.params.accountId);
    if (Number.isNaN(clinicId) || Number.isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid ids" });
    }

    const isFrozen = Boolean(req.body?.isFrozen);

    const { data, error } = await supabase
      .from("system_users")
      .update({ is_frozen: isFrozen })
      .eq("id", accountId)
      .eq("clinic_id", clinicId)
      .select("id,username,name,is_frozen")
      .single();

    if (error || !data) {
      req.log.error({ err: error }, "Failed to toggle account frozen state");
      return res.status(404).json({ error: "الحساب غير موجود في هذه العيادة" });
    }

    // Freeze takes effect immediately – drop the cached user status.
    invalidateUserStatus(accountId);

    res.json({ id: data.id, username: data.username, name: data.name, isFrozen: data.is_frozen });
  } catch (err: any) {
    req.log.error({ err }, "Failed to toggle account frozen state");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
