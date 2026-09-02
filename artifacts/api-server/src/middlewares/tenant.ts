import { Request, Response, NextFunction } from "express";

export interface TenantRequest extends Request {
  tenant?: {
    clinicId: number;
    isSuperadmin: boolean;
  };
  user?: any;
}

export const tenantMiddleware = (req: TenantRequest, res: Response, next: NextFunction) => {
  // We assume authMiddleware runs before this and attaches `req.user`
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: No user found" });
  }

  const { clinicId, isSuperadmin } = req.user;

  if (clinicId === undefined || clinicId === null) {
    return res.status(400).json({ error: "Bad Request: No clinic associated with user" });
  }

  req.tenant = {
    clinicId: Number(clinicId),
    isSuperadmin: Boolean(isSuperadmin),
  };

  next();
};

export const superadminMiddleware = (req: TenantRequest, res: Response, next: NextFunction) => {
  if (!req.tenant?.isSuperadmin) {
    return res.status(403).json({ error: "Forbidden: Superadmin access required" });
  }
  next();
};
