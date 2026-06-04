import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { ok, created, notFound, paginated } from "../utils/response";
import { AppError } from "../middleware/error.middleware";

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.enum([
    "RESTAURANT", "FAST_FOOD", "CAFE", "PHARMACY", "GROCERY",
    "BAKERY", "FOOD_TRUCK", "DESSERTS", "BEVERAGES", "OTHER",
  ]),
  address: z.string(),
  city: z.string(),
  province: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  deliveryFee: z.number().min(0).default(0),
  minOrder: z.number().min(0).default(0),
  estimatedTime: z.number().min(5).default(30),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

export const createBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createSchema.parse(req.body);
    const exists = await prisma.business.findUnique({ where: { userId: req.user!.userId } });
    if (exists) throw new AppError("Ya tienes un comercio registrado", 400);

    const business = await prisma.business.create({
      data: { ...data, userId: req.user!.userId },
    });
    created(res, business, "Comercio registrado. Pendiente de aprobación.");
  } catch (err) {
    next(err);
  }
};

export const getMyBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findUnique({
      where: { userId: req.user!.userId },
      include: { plan: true, productCategories: { include: { products: true } } },
    });
    if (!business) return notFound(res, "Comercio no encontrado");
    ok(res, business);
  } catch (err) {
    next(err);
  }
};

export const updateBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findUnique({ where: { userId: req.user!.userId } });
    if (!business) return notFound(res, "Comercio no encontrado");

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: req.body,
    });
    ok(res, updated);
  } catch (err) {
    next(err);
  }
};

export const toggleStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findUnique({ where: { userId: req.user!.userId } });
    if (!business) return notFound(res, "Comercio no encontrado");
    if (business.status !== "ACTIVE") throw new AppError("Comercio no activo", 400);

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: { isOpen: !business.isOpen },
    });
    ok(res, { isOpen: updated.isOpen }, `Tienda ${updated.isOpen ? "abierta" : "cerrada"}`);
  } catch (err) {
    next(err);
  }
};

export const listBusinesses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, city, search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = { status: "ACTIVE", isOpen: true };
    if (category) where.category = category;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: { plan: { select: { name: true } } },
        orderBy: [{ isHighlighted: "desc" }, { rating: "desc" }],
        skip,
        take: parseInt(limit),
      }),
      prisma.business.count({ where }),
    ]);

    paginated(res, businesses, total, parseInt(page), parseInt(limit));
  } catch (err) {
    next(err);
  }
};

export const getBusinessById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.params.id, status: "ACTIVE" },
      include: {
        productCategories: {
          include: { products: { where: { isAvailable: true }, orderBy: { isFeatured: "desc" } } },
          orderBy: { sortOrder: "asc" },
        },
        promotions: { where: { isActive: true, endDate: { gte: new Date() } } },
      },
    });
    if (!business) return notFound(res);
    ok(res, business);
  } catch (err) {
    next(err);
  }
};

export const getBusinessDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findUnique({ where: { userId: req.user!.userId } });
    if (!business) return notFound(res, "Comercio no encontrado");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersToday, ordersTotal, revenueToday, pendingOrders] = await Promise.all([
      prisma.order.count({ where: { businessId: business.id, createdAt: { gte: today } } }),
      prisma.order.count({ where: { businessId: business.id, status: "DELIVERED" } }),
      prisma.order.aggregate({
        where: { businessId: business.id, status: "DELIVERED", createdAt: { gte: today } },
        _sum: { subtotal: true, platformFee: true },
      }),
      prisma.order.findMany({
        where: { businessId: business.id, status: { in: ["RECEIVED", "ACCEPTED", "PREPARING"] } },
        include: { client: { select: { name: true, phone: true } }, items: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const grossToday = revenueToday._sum.subtotal ?? 0;
    const feesToday = revenueToday._sum.platformFee ?? 0;

    ok(res, {
      business: { id: business.id, name: business.name, status: business.status, isOpen: business.isOpen, rating: business.rating },
      stats: { ordersToday, ordersTotal, grossToday, feesToday, netToday: grossToday - feesToday },
      pendingOrders,
    });
  } catch (err) {
    next(err);
  }
};
