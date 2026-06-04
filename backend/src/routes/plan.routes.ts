import { Router } from "express";
import { listPlans, createPlan, updatePlan, togglePlanStatus, subscribeToPlan } from "../controllers/plan.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/", listPlans);
router.post("/:id/subscribe", authenticate, authorize("PARTNER"), subscribeToPlan);
router.post("/", authenticate, authorize("ADMIN", "SUPER_ADMIN"), createPlan);
router.patch("/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), updatePlan);
router.patch("/:id/toggle", authenticate, authorize("ADMIN", "SUPER_ADMIN"), togglePlanStatus);

export default router;
