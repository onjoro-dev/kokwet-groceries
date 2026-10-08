import { Request, Response } from "express";
import slugify from "slugify";
import Category from "../models/Category";
import Product from "../models/Product";
import { asyncHandler } from "../middleware/asyncHandler";
import { recordAudit } from "../utils/audit";

// @route GET /api/categories
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ order: 1, name: 1 });
  res.json(categories);
});

// @route GET /api/categories/:slug
export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }
  res.json(category);
});

// @route POST /api/categories (admin)
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, icon, image, order } = req.body;
  if (!name) return res.status(400).json({ message: "Category name is required." });

  const slug = slugify(name, { lower: true });
  const exists = await Category.findOne({ slug });
  if (exists) return res.status(400).json({ message: "A category with this name already exists." });

  const category = await Category.create({ name, slug, icon, image, order });
  await recordAudit(req, "category.created", "category", category._id.toString(), `Created category ${category.name}.`);
  res.status(201).json(category);
});

// @route PUT /api/categories/:id (admin)
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, icon, image, order } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found." });

  if (name) {
    category.name = name;
    category.slug = slugify(name, { lower: true });
  }
  if (icon !== undefined) category.icon = icon;
  if (image !== undefined) category.image = image;
  if (order !== undefined) category.order = order;

  await category.save();
  await recordAudit(req, "category.updated", "category", category._id.toString(), `Updated category ${category.name}.`);
  res.json(category);
});

// @route DELETE /api/categories/:id (admin)
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const inUse = await Product.countDocuments({ category: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({
      message: `Can't delete this category — ${inUse} product(s) still use it. Move or delete those products first.`,
    });
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found." });
  await recordAudit(req, "category.deleted", "category", category._id.toString(), `Deleted category ${category.name}.`);
  res.json({ message: "Category deleted." });
});
