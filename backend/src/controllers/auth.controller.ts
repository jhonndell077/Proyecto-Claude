import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../index";
import { signToken } from "../utils/jwt";
import { ok, created, badRequest } from "../utils/response";
import { AppError } from "../middleware/error.middleware";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["CLIENT", "PARTNER", "DRIVER"]).default("CLIENT"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return badRequest(res, "El email ya está registrado");

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hashed, status: "ACTIVE" },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    if (data.role === "DRIVER") {
      await prisma.driver.create({ data: { userId: user.id } });
    }

    const token = signToken({ userId: user.id, role: user.role });
    created(res, { user, token }, "Cuenta creada exitosamente");
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Credenciales incorrectas", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError("Credenciales incorrectas", 401);

    if (user.status === "SUSPENDED")
      throw new AppError("Cuenta suspendida. Contacta soporte.", 403);

    const token = signToken({ userId: user.id, role: user.role });
    ok(res, {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      token,
    }, "Sesión iniciada");
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, phone: true, avatar: true, status: true },
    });
    ok(res, user);
  } catch (err) {
    next(err);
  }
};
