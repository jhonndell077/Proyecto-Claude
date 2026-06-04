import { Router } from "express";
import {
  getDashboard, listBusinesses, updateBusinessStatus, toggleHighlight,
  listUsers, updateUserStatus, listDrivers, updateDriverStatus, getFinancialReport,
} from "../controllers/admin.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"));

router.get("/dashboard", getDashboard);
router.get("/businesses", listBusinesses);
router.patch("/businesses/:id/status", updateBusinessStatus);
router.patch("/businesses/:id/highlight", toggleHighlight);
router.get("/users", listUsers);
router.patch("/users/:id/status", updateUserStatus);
router.get("/drivers", listDrivers);
router.patch("/drivers/:id/status", updateDriverStatus);
router.get("/reports/financial", getFinancialReport);

export default router;
