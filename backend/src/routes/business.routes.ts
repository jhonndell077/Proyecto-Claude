import { Router } from "express";
import {
  createBusiness, getMyBusiness, updateBusiness, toggleStore,
  listBusinesses, getBusinessById, getBusinessDashboard,
} from "../controllers/business.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/", listBusinesses);
router.get("/:id", getBusinessById);

router.use(authenticate);
router.post("/", authorize("PARTNER"), createBusiness);
router.get("/me/info", authorize("PARTNER"), getMyBusiness);
router.get("/me/dashboard", authorize("PARTNER"), getBusinessDashboard);
router.patch("/me", authorize("PARTNER"), updateBusiness);
router.patch("/me/toggle", authorize("PARTNER"), toggleStore);

export default router;
