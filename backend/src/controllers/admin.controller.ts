import { Request, Response, NextFunction } from "express";
import { prisma } from "../index";
import { ok, notFound } from "../utils/response";

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers, totalBusinesses, activeBusinesses, pendingBusinesses,
      totalDrivers, totalOrders, ordersToday,
      revenueData, membershipRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.business.count({ where: { status: "ACTIVE" } }),
      prisma.business.count({ where: { status: "PENDING" } }),
      prisma.driver.count({ where: { status: "ACTIVE" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { platformFee: true, total: true },
      }),
      prisma.membershipPayment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

    ok(res, {
      users: { total: totalUsers },
      businesses: { total: totalBusinesses, active: activeBusinesses, pending: pendingBusinesses },
      drivers: { active: totalDrivers },
      orders: { total: totalOrders, today: ordersToday },
      revenue: {
        commissions: revenueData._sum.platformFee ?? 0,
        gmv: revenueData._sum.total ?? 0,
        memberships: membershipRevenue._sum.amount ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const listBusinesses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query as { status?: string };
    const businesses = await prisma.business.findMany({
      where: status ? { status: status as never } : {},
      include: {
        user: { select: { name: true, email: true, phone: true } },
        plan: { select: { name: true } },
        _count: { select: { orders: true, products: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    ok(res, businesses);
  } catch (err) {
    next(err);
  }
};

export const updateBusinessStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, reason } = req.body as { status: string; reason?: string };
    const business = await prisma.business.findUnique({ where: { id: req.params.id } });
    if (!business) return notFound(res, "Comercio no encontrado");

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: { status: status as never },
    });
    ok(res, updated, `Comercio ${status === "ACTIVE" ? "aprobado" : "actualizado"}`);
  } catch (err) {
    next(err);
  }
};

export const toggleHighlight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findUnique({ where: { id: req.params.id } });
    if (!business) return notFound(res);
    const updated = await prisma.business.update({
      where: { id: business.id },
      data: { isHighlighted: !business.isHighlighted },
    });
    ok(res, { isHighlighted: updated.isHighlighted });
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, search } = req.query as { role?: string; search?: string };
    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role: role as never } : {}),
        ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : {}),
      },
      select: { id: true, name: true, email: true, role: true, status: true, phone: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    ok(res, users);
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status: string };
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: status as never },
      select: { id: true, name: true, status: true },
    });
    ok(res, user);
  } catch (err) {
    next(err);
  }
};

export const listDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    ok(res, drivers);
  } catch (err) {
    next(err);
  }
};

export const updateDriverStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status: string };
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: { status: status as never },
    });
    ok(res, driver);
  } catch (err) {
    next(err);
  }
};

export const getFinancialReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = to ? new Date(to) : new Date();

    const [orders, memberships, topBusinesses] = await Promise.all([
      prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: { gte: start, lte: end } },
        _count: true,
        _sum: { total: true, platformFee: true },
      }),
      prisma.membershipPayment.aggregate({
        where: { status: "PAID", createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.order.groupBy({
        by: ["businessId"],
        where: { status: "DELIVERED", createdAt: { gte: start, lte: end } },
        _sum: { total: true, platformFee: true },
        _count: true,
        orderBy: { _sum: { total: "desc" } },
        take: 10,
      }),
    ]);

    ok(res, { period: { from: start, to: end }, orders, memberships, topBusinesses });
  } catch (err) {
    next(err);
  }
};
