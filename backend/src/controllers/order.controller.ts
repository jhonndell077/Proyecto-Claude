import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { ok, created, notFound, forbidden } from "../utils/response";
import { AppError } from "../middleware/error.middleware";
import { getIO } from "../socket";

const createOrderSchema = z.object({
  businessId: z.string(),
  type: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
  addressId: z.string().optional(),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER"]).default("CASH"),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
      notes: z.string().optional(),
    })
  ).min(1),
});

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createOrderSchema.parse(req.body);

    const business = await prisma.business.findUnique({ where: { id: data.businessId } });
    if (!business || !business.isOpen) throw new AppError("El comercio no está disponible", 400);

    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) }, businessId: business.id, isAvailable: true },
    });

    if (products.length !== data.items.length) throw new AppError("Algunos productos no están disponibles", 400);

    const itemsWithPrice = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return { ...item, price: product.price, productName: product.name };
    });

    const subtotal = itemsWithPrice.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const deliveryFee = data.type === "DELIVERY" ? business.deliveryFee : 0;
    const platformFee = subtotal * (business.commissionRate / 100);
    const total = subtotal + deliveryFee;

    if (subtotal < business.minOrder) {
      throw new AppError(`Pedido mínimo: RD$${business.minOrder}`, 400);
    }

    const order = await prisma.order.create({
      data: {
        clientId: req.user!.userId,
        businessId: business.id,
        type: data.type,
        addressId: data.addressId,
        deliveryAddress: data.deliveryAddress,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        subtotal,
        deliveryFee,
        platformFee,
        total,
        estimatedTime: business.estimatedTime,
        items: {
          create: itemsWithPrice.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            price: i.price,
            quantity: i.quantity,
            notes: i.notes,
          })),
        },
        statusHistory: { create: { status: "RECEIVED" } },
      },
      include: { items: true, business: { select: { name: true } } },
    });

    getIO()?.to(`business:${business.id}`).emit("new_order", order);
    created(res, order, "Pedido creado exitosamente");
  } catch (err) {
    next(err);
  }
};

export const getClientOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { clientId: req.user!.userId },
      include: {
        business: { select: { name: true, logo: true } },
        items: true,
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });
    ok(res, orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        client: { select: { name: true, phone: true } },
        business: { select: { name: true, logo: true, phone: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } },
        items: true,
        statusHistory: { orderBy: { timestamp: "asc" } },
        review: true,
      },
    });
    if (!order) return notFound(res);

    const userId = req.user!.userId;
    const isOwner = order.clientId === userId;
    const isBusiness = (await prisma.business.findFirst({ where: { userId, id: order.businessId } })) !== null;
    const isDriver = order.driver?.userId === userId;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);

    if (!isOwner && !isBusiness && !isDriver && !isAdmin) return forbidden(res);
    ok(res, order);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, note } = req.body as { status: string; note?: string };
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return notFound(res);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: status as never,
        statusHistory: { create: { status: status as never, note } },
      },
    });

    getIO()?.to(`order:${order.id}`).emit("order_status", { orderId: order.id, status });
    ok(res, updated);
  } catch (err) {
    next(err);
  }
};

export const getBusinessOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findUnique({ where: { userId: req.user!.userId } });
    if (!business) return notFound(res, "Comercio no encontrado");

    const { status } = req.query as { status?: string };
    const orders = await prisma.order.findMany({
      where: {
        businessId: business.id,
        ...(status ? { status: status as never } : {}),
      },
      include: {
        client: { select: { name: true, phone: true } },
        items: true,
        driver: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    ok(res, orders);
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return notFound(res);
    if (order.clientId !== req.user!.userId) return forbidden(res);
    if (!["RECEIVED", "ACCEPTED"].includes(order.status)) {
      throw new AppError("No se puede cancelar en este estado", 400);
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        cancelReason: req.body.reason,
        statusHistory: { create: { status: "CANCELLED", note: req.body.reason } },
      },
    });
    ok(res, updated, "Pedido cancelado");
  } catch (err) {
    next(err);
  }
};
