import type { Request, Response, NextFunction } from "express";
import { supabase } from "./supabase";

/**
 * Clinic subscription status enforcement.
 *
 * When a clinic is suspended (clinics.is_active = false):
 *  - login is rejected with 423 CLINIC_SUSPENDED
 *  - every authenticated request from its users is rejected with 423
 *  - the frontend polls /auth/status and shows the suspension screen instantly
 *
 * Statuses are cached in-memory for a few seconds to keep the per-request
 * check cheap; the cache is invalidated the moment the platform toggles it.
 */

const TTL_MS = 5000;
const cache = new Map<number, { active: boolean; at: number }>();
const userCache = new Map<number, { active: boolean; at: number }>();

export function invalidateClinicStatus(clinicId?: number) {
  if (clinicId == null) cache.clear();
  else cache.delete(Number(clinicId));
}

export function invalidateUserStatus(userId?: number) {
  if (userId == null) userCache.clear();
  else userCache.delete(Number(userId));
}

export async function isClinicActive(clinicId: number): Promise<boolean> {
  const key = Number(clinicId);
  if (!Number.isFinite(key)) return true;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.active;

  const { data, error } = await supabase
    .from("clinics")
    .select("is_active")
    .eq("id", key)
    .maybeSingle();

  // On data-layer problems fail open – never lock clinics out due to an outage.
  const active = error ? true : data ? data.is_active !== false : true;
  cache.set(key, { active, at: Date.now() });
  return active;
}

/** false => the individual account has been frozen by the platform. */
export async function isUserActive(userId: number): Promise<boolean> {
  const key = Number(userId);
  if (!Number.isFinite(key)) return true;

  const hit = userCache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.active;

  const { data, error } = await supabase
    .from("system_users")
    .select("is_frozen")
    .eq("id", key)
    .maybeSingle();

  const active = error ? true : data ? data.is_frozen !== true : true;
  userCache.set(key, { active, at: Date.now() });
  return active;
}

export function suspendedResponse(res: Response, clinicName?: string | null) {
  return res.status(423).json({
    error: "CLINIC_SUSPENDED",
    messageAr:
      "تم تعليق اشتراك العيادة مؤقتاً من قبل إدارة المنصة. يرجى التواصل مع الدعم لإعادة التفعيل.",
    clinicName: clinicName ?? null,
    suspendedAt: new Date().toISOString(),
  });
}

export function accountSuspendedResponse(res: Response, name?: string | null, username?: string | null) {
  return res.status(423).json({
    error: "ACCOUNT_SUSPENDED",
    messageAr:
      "تم إيقاف حسابك من قبل إدارة المنصة. لا يمكنك الدخول أو العمل حتى إعادة تفعيل الحساب.",
    accountName: name ?? null,
    username: username ?? null,
    suspendedAt: new Date().toISOString(),
  });
}

/** Express guard mounted right after authMiddleware. */
export async function subscriptionGuard(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.path.startsWith("/auth/") || req.path.startsWith("/health")) return next();

    const user: any = (req as any).user;
    if (!user || user.isSuperadmin) return next();

    const active = await isClinicActive(Number(user.clinicId));
    if (!active) return suspendedResponse(res, user.clinicName);

    const userActive = await isUserActive(Number(user.id));
    if (!userActive) return accountSuspendedResponse(res, user.name, user.username);
  } catch {
    return next();
  }
  next();
}
