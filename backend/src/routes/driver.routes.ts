import { Router } from "express";
import {
  getDriverDashboard, toggleAvailability, getAvailableOrders,
  acceptOrder, updateDeliveryStatus, getDriverHistory,
} from "../controllers/driver.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate, authorize("DRIVER"));

router.get("/dashboard", getDriverDashboard);
router.patch("/availability", toggleAvailability);
router.get("/orders/available", getAvailableOrders);
router.get("/orders/history", getDriverHistory);
router.post("/orders/:id/accept", acceptOrder);
router.patch("/orders/:id/status", updateDeliveryStatus);

export default router;
