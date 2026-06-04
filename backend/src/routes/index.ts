import { Router } from "express";
import authRoutes from "./auth.routes";
import businessRoutes from "./business.routes";
import productRoutes from "./product.routes";
import orderRoutes from "./order.routes";
import driverRoutes from "./driver.routes";
import adminRoutes from "./admin.routes";
import planRoutes from "./plan.routes";

const router = Router();

router.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date() }));
router.use("/auth", authRoutes);
router.use("/businesses", businessRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/driver", driverRoutes);
router.use("/admin", adminRoutes);
router.use("/plans", planRoutes);

export default router;
