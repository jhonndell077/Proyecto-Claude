import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { ok, created, notFound } from "../utils/response";
import { AppError } from "../middleware/error.middleware";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  cost: z.number().min(0).default(0),
  categoryId: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const categorySchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().default(0),
});

async function getOwnBusiness(userId: string) {
  const b = await prisma.business.findUnique({ where: { userId } });
  if (!b) throw new AppError("Comercio no encontrado", 404);
  return b;
}

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await getOwnBusiness(req.user!.userId);
    const products = await prisma.product.findMany({
      where: { businessId: business.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    ok(res, products);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await getOwnBusiness(req.user!.userId);
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data: { ...data, businessId: business.id } });
    created(res, product, "Producto creado");
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await getOwnBusiness(req.user!.userId);
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!product) return notFound(res, "Producto no encontrado");

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: productSchema.partial().parse(req.body),
    });
    ok(res, updated);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await getOwnBusiness(req.user!.userId);
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!product) return notFound(res, "Producto no encontrado");
    await prisma.product.delete({ where: { id: product.id } });
    ok(res, null, "Producto eliminado");
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await getOwnBusiness(req.user!.userId);
    const data = categorySchema.parse(req.body);
    const category = await prisma.productCategory.create({ data: { ...data, businessId: business.id } });
    created(res, category);
  } catch (err) {
    next(err);
  }
};

export const getMarginReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const business = await getOwnBusiness(req.user!.userId);
    const products = await prisma.product.findMany({
      where: { businessId: business.id, cost: { gt: 0 } },
    });

    const report = products.map((p) => {
      const commission = p.price * (business.commissionRate / 100);
      const netProfit = p.price - p.cost - commission;
      const margin = p.price > 0 ? (netProfit / p.price) * 100 : 0;
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        cost: p.cost,
        commission: +commission.toFixed(2),
        netProfit: +netProfit.toFixed(2),
        margin: +margin.toFixed(1),
      };
    });

    report.sort((a, b) => b.margin - a.margin);
    ok(res, report);
  } catch (err) {
    next(err);
  }
};
