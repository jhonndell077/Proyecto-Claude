import { Router } from "express";
import {
  createOrder, getClientOrders, getOrderById,
  updateOrderStatus, getBusinessOrders, cancelOrder,
} from "../controllers/order.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);

router.post("/", authorize("CLIENT"), createOrder);
router.get("/my", authorize("CLIENT"), getClientOrders);
router.get("/business", authorize("PARTNER"), getBusinessOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", authorize("PARTNER", "ADMIN", "SUPER_ADMIN"), updateOrderStatus);
router.patch("/:id/cancel", authorize("CLIENT"), cancelOrder);

export default router;
