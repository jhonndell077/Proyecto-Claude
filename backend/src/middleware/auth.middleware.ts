import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { prisma } from "../index";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { dbUser?: { status: string } };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token requerido" });
  }
  try {
    const token = header.split(" ")[1];
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true, role: true },
    });
    if (!user || user.status === "SUSPENDED" || user.status === "INACTIVE") {
      return res.status(401).json({ success: false, message: "Cuenta inactiva" });
    }
    req.user = { userId: payload.userId, role: user.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
};

export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Sin permisos" });
    }
    next();
  };
