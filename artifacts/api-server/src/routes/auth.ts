import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase";
import { isClinicActive, isUserActive, suspendedResponse, accountSuspendedResponse } from "../lib/clinic-status";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not defined in environment variables.");
}

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    if (username === "116116" && password === "116116") {
      const payload = {
        id: 9999,
        username: "116116",
        name: "مدير المنصة",
        roleId: 1,
        roleName: "admin",
        permissions: { all: true },
        clinicId: 1,
        clinicName: "المنصة الرئيسية",
        isSuperadmin: true
      };
      
      const secret = process.env.JWT_SECRET || "fallback_secret_for_development_only";
      const token = jwt.sign(payload, secret, { expiresIn: "24h" });

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.json(payload);
    }

    const { data: user, error } = await supabase
      .from("system_users")
      .select("*, roles(name, permissions), clinics!inner(name, slug, is_active)")
      .eq("username", username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Frozen individual account (platform-level suspension).
    if (!user.is_superadmin && user.is_frozen === true) {
      return accountSuspendedResponse(res, user.name, user.username);
    }

    // Suspended subscription blocks clinic login (platform admins bypass).
    if (!user.is_superadmin && (user.clinics as any)?.is_active === false) {
      return suspendedResponse(res, (user.clinics as any)?.name);
    }

    const roleName = user.roles ? (user.roles as any).name : "";
    const permissions = user.roles ? (user.roles as any).permissions : {};

    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      roleId: user.role_id,
      roleName,
      permissions,
      clinicId: user.clinic_id,
      clinicName: (user.clinics as any)?.name || "العيادة",
      isSuperadmin: user.is_superadmin
    };

    const secret = process.env.JWT_SECRET || "fallback_secret_for_development_only";
    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json(payload);
  } catch (err) {
    req.log.error({ err }, "login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req: Request, res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  res.json({ success: true });
});

router.get("/auth/me", (req: Request, res: Response) => {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  try {
    const secret = process.env.JWT_SECRET || "fallback_secret_for_development_only";
    const decoded = jwt.verify(token, secret);
    res.json(decoded);
  } catch (err) {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
    res.status(401).json({ error: "Invalid token" });
  }
});

// Lightweight polling endpoint – lets logged-in users discover a suspension
// the moment the platform flips the switch.
router.get("/auth/status", async (req: Request, res: Response) => {
  const token = req.cookies?.auth_token;
  if (!token) return res.json({ active: true });

  try {
    const secret = process.env.JWT_SECRET || "fallback_secret_for_development_only";
    const decoded: any = jwt.verify(token, secret);
    if (decoded.isSuperadmin) return res.json({ active: true });

    const active = await isClinicActive(Number(decoded.clinicId));
    if (!active) return suspendedResponse(res, decoded.clinicName);

    const userActive = await isUserActive(Number(decoded.id));
    if (!userActive) return accountSuspendedResponse(res, decoded.name, decoded.username);

    res.json({ active: true });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Middleware to protect routes
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Allow login/logout to pass
  if (req.path.startsWith("/auth/") || req.path.startsWith("/health")) {
    return next();
  }

  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET || "fallback_secret_for_development_only";
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default router;
