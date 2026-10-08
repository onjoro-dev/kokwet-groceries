import { Router } from "express";
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { protect, storeStaffOnly } from "../middleware/auth";

const router = Router();

router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);
router.post("/", protect, storeStaffOnly, createCategory);
router.put("/:id", protect, storeStaffOnly, updateCategory);
router.delete("/:id", protect, storeStaffOnly, deleteCategory);

export default router;
