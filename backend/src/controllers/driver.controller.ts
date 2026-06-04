import { Request, Response, NextFunction } from "express";
import { prisma } from "../index";
import { ok, notFound } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { getIO } from "../socket";

export const getDriverDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { userId: req.user!.userId } });
    if (!driver) return notFound(res, "Repartidor no encontrado");
    if (driver.status !== "ACTIVE") throw new AppError("Cuenta no activa", 403);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [deliveriesToday, earningsToday, activeOrders] = await Promise.all([
      prisma.order.count({ where: { driverId: driver.id, status: "DELIVERED", createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { driverId: driver.id, status: "DELIVERED", createdAt: { gte: today } },
        _sum: { deliveryFee: true },
      }),
      prisma.order.findMany({
        where: { driverId: driver.id, status: { in: ["ASSIGNED", "PICKED_UP", "ON_WAY"] } },
        include: {
          client: { select: { name: true, phone: true } },
          business: { select: { name: true, address: true, phone: true } },
          items: true,
        },
      }),
    ]);

    ok(res, {
      driver: { id: driver.id, isAvailable: driver.isAvailable, rating: driver.rating, vehicleType: driver.vehicleType },
      stats: { deliveriesToday, earningsToday: earningsToday._sum.deliveryFee ?? 0 },
      activeOrders,
    });
  } catch (err) {
    next(err);
  }
};

export const toggleAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { userId: req.user!.userId } });
    if (!driver) return notFound(res);
    if (driver.status !== "ACTIVE") throw new AppError("Cuenta no activa", 403);

    const updated = await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: !driver.isAvailable },
    });
    ok(res, { isAvailable: updated.isAvailable });
  } catch (err) {
    next(err);
  }
};

export const getAvailableOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "READY", driverId: null, type: "DELIVERY" },
      include: {
        business: { select: { name: true, address: true, city: true } },
        client: { select: { name: true } },
        items: { select: { productName: true, quantity: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    ok(res, orders);
  } catch (err) {
    next(err);
  }
};

export const acceptOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { userId: req.user!.userId } });
    if (!driver || driver.status !== "ACTIVE") throw new AppError("No autorizado", 403);

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.status !== "READY" || order.driverId) {
      throw new AppError("Pedido no disponible", 400);
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        driverId: driver.id,
        status: "ASSIGNED",
        statusHistory: { create: { status: "ASSIGNED" } },
      },
    });

    getIO()?.to(`order:${order.id}`).emit("order_status", { orderId: order.id, status: "ASSIGNED" });
    ok(res, updated, "Pedido aceptado");
  } catch (err) {
    next(err);
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { userId: req.user!.userId } });
    if (!driver) return notFound(res);

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, driverId: driver.id },
    });
    if (!order) return notFound(res);

    const { status } = req.body as { status: "PICKED_UP" | "ON_WAY" | "DELIVERED" };
    const validTransitions: Record<string, string[]> = {
      ASSIGNED: ["PICKED_UP"],
      PICKED_UP: ["ON_WAY"],
      ON_WAY: ["DELIVERED"],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new AppError("Transición de estado inválida", 400);
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status, statusHistory: { create: { status } } },
    });

    getIO()?.to(`order:${order.id}`).emit("order_status", { orderId: order.id, status });
    ok(res, updated);
  } catch (err) {
    next(err);
  }
};

export const getDriverHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { userId: req.user!.userId } });
    if (!driver) return notFound(res);

    const orders = await prisma.order.findMany({
      where: { driverId: driver.id, status: "DELIVERED" },
      include: { business: { select: { name: true } }, client: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    ok(res, orders);
  } catch (err) {
    next(err);
  }
};
