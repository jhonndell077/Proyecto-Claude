import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { ok, created, notFound } from "../utils/response";

const planSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().min(0),
  maxProducts: z.number().int().default(-1),
  commissionRate: z.number().min(0).max(100),
  isHighlighted: z.boolean().default(false),
  features: z.array(z.string()),
  sortOrder: z.number().default(0),
});

export const listPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { businesses: true } } },
    });
    ok(res, plans);
  } catch (err) {
    next(err);
  }
};

export const createPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = planSchema.parse(req.body);
    const plan = await prisma.plan.create({ data });
    created(res, plan, "Plan creado");
  } catch (err) {
    next(err);
  }
};

export const updatePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: req.params.id } });
    if (!plan) return notFound(res, "Plan no encontrado");
    const updated = await prisma.plan.update({
      where: { id: plan.id },
      data: planSchema.partial().parse(req.body),
    });
    ok(res, updated);
  } catch (err) {
    next(err);
  }
};

export const togglePlanStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: req.params.id } });
    if (!plan) return notFound(res);
    const updated = await prisma.plan.update({
      where: { id: plan.id },
      data: { status: plan.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
    });
    ok(res, updated);
  } catch (err) {
    next(err);
  }
};

export const subscribeToPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: req.params.id, status: "ACTIVE" } });
    if (!plan) return notFound(res, "Plan no encontrado");

    const business = await prisma.business.findUnique({ where: { userId: req.user!.userId } });
    if (!business) return notFound(res, "Comercio no encontrado");

    const period = new Date().toISOString().slice(0, 7);
    await prisma.$transaction([
      prisma.business.update({
        where: { id: business.id },
        data: { planId: plan.id, commissionRate: plan.commissionRate },
      }),
      prisma.membershipPayment.create({
        data: { businessId: business.id, planId: plan.id, amount: plan.price, period, status: "PENDING" },
      }),
    ]);

    ok(res, null, `Suscripción al plan ${plan.name} registrada`);
  } catch (err) {
    next(err);
  }
};
