import { Router } from "express";
import {
  listProducts, createProduct, updateProduct, deleteProduct,
  createCategory, getMarginReport,
} from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate, authorize("PARTNER"));

router.get("/", listProducts);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/categories", createCategory);
router.get("/reports/margin", getMarginReport);

export default router;
