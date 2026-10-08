import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  getProductPromotions,
} from "../controllers/productController";
import { protect, storeStaffOnly } from "../middleware/auth";
import { uploadProductImage } from "../controllers/productImageController";
import express from "express";

const router = Router();

router.get("/", getProducts);
router.get("/promotions", getProductPromotions);
router.get("/admin/all", protect, storeStaffOnly, getAdminProducts);
router.get("/:slug", getProductBySlug);
router.post("/upload-image", protect, storeStaffOnly, express.raw({ type: ["image/jpeg", "image/png", "image/webp", "image/gif"], limit: "5mb" }), uploadProductImage);
router.post("/", protect, storeStaffOnly, createProduct);
router.put("/:id", protect, storeStaffOnly, updateProduct);
router.delete("/:id", protect, storeStaffOnly, deleteProduct);

export default router;
