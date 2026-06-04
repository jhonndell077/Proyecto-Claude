import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 10);

  // Plans
  await prisma.plan.createMany({
    data: [
      {
        name: "Básico",
        description: "Ideal para comenzar en la plataforma",
        price: 0,
        maxProducts: 20,
        commissionRate: 18,
        features: ["Hasta 20 productos", "Reportes básicos", "Soporte estándar"],
        sortOrder: 1,
      },
      {
        name: "Pro",
        description: "Para comercios en crecimiento",
        price: 1500,
        maxProducts: 100,
        commissionRate: 15,
        isHighlighted: true,
        features: [
          "Hasta 100 productos",
          "Reportes avanzados",
          "Mejor posición en búsquedas",
          "Promociones internas",
          "Análisis de margen",
        ],
        sortOrder: 2,
      },
      {
        name: "Premium",
        description: "Máxima visibilidad y menores comisiones",
        price: 3500,
        maxProducts: -1,
        commissionRate: 10,
        features: [
          "Productos ilimitados",
          "Posicionamiento destacado",
          "Publicidad dentro de la app",
          "Menor comisión (10%)",
          "Reportes de rentabilidad completos",
          "Soporte prioritario",
          "Estadísticas avanzadas",
        ],
        sortOrder: 3,
      },
    ],
    skipDuplicates: true,
  });

  // Super Admin
  const adminEmail = "admin@deliveryapp.do";
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: await hash("Admin123!"),
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });
  }

  // Demo partner
  const partnerEmail = "socio@demo.do";
  const partnerExists = await prisma.user.findUnique({ where: { email: partnerEmail } });
  if (!partnerExists) {
    const plan = await prisma.plan.findFirst({ where: { name: "Pro" } });
    const partner = await prisma.user.create({
      data: {
        name: "Restaurante Demo",
        email: partnerEmail,
        password: await hash("Demo123!"),
        role: "PARTNER",
        status: "ACTIVE",
      },
    });
    const business = await prisma.business.create({
      data: {
        userId: partner.id,
        name: "Restaurante El Criollo",
        description: "Lo mejor de la cocina dominicana",
        category: "RESTAURANT",
        address: "Calle Principal #45",
        city: "Santo Domingo",
        province: "Distrito Nacional",
        phone: "809-555-1234",
        status: "ACTIVE",
        isOpen: true,
        planId: plan?.id,
        commissionRate: plan?.commissionRate ?? 15,
        deliveryFee: 100,
        minOrder: 200,
        estimatedTime: 25,
      },
    });
    const cat = await prisma.productCategory.create({
      data: { businessId: business.id, name: "Platos Principales", sortOrder: 1 },
    });
    await prisma.product.createMany({
      data: [
        { businessId: business.id, categoryId: cat.id, name: "Bandera Dominicana", price: 350, cost: 150, description: "Arroz, habichuelas y pollo guisado", isFeatured: true },
        { businessId: business.id, categoryId: cat.id, name: "Mangú con los tres golpes", price: 280, cost: 100, description: "Mangú, salami, huevo y queso" },
        { businessId: business.id, categoryId: cat.id, name: "Sancocho", price: 420, cost: 180, description: "Sancocho de siete carnes" },
        { businessId: business.id, categoryId: cat.id, name: "Pollo al horno", price: 390, cost: 160 },
      ],
    });
  }

  // Demo client
  const clientEmail = "cliente@demo.do";
  if (!await prisma.user.findUnique({ where: { email: clientEmail } })) {
    await prisma.user.create({
      data: {
        name: "Cliente Demo",
        email: clientEmail,
        password: await hash("Demo123!"),
        role: "CLIENT",
        status: "ACTIVE",
      },
    });
  }

  console.log("Seed completado");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
