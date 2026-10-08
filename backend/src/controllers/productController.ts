import { Request, Response } from "express";
import slugify from "slugify";
import Product from "../models/Product";
import Category from "../models/Category";
import Order from "../models/Order";
import { recordAudit } from "../utils/audit";
import { recordInventoryMovement } from "../utils/inventory";
import { asyncHandler } from "../middleware/asyncHandler";

// @route GET /api/products
// Supports: ?search=&category=&featured=true&minPrice=&maxPrice=&sort=&page=&limit=
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, featured, minPrice, maxPrice, sort, brand, dietary, offer, new: newArrival } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(60, Number(req.query.limit) || 20);

  const filter: Record<string, unknown> = { isActive: true };

  if (search) {
    filter.$text = { $search: String(search) };
  }
  if (category) {
    filter.category = category;
  }
  if (featured === "true") {
    filter.isFeatured = true;
  }
  if (brand) filter.brand = String(brand);
  if (dietary) filter.dietaryLifestyle = String(dietary);
  if (offer === "true") filter.$expr = { $gt: ["$compareAtPrice", "$price"] };
  if (newArrival === "true") filter.createdAt = { $gte: new Date(Date.now() - 30 * 86400000) };
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { ratingAverage: -1 };
  if (sort === "name") sortOption = { name: 1 };
  if (sort === "newest") sortOption = { createdAt: -1 };
  if (sort === "popular") sortOption = { ratingCount: -1, ratingAverage: -1 };

  const [products, total, brands, dietaryOptions, categories] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug icon")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
    Product.distinct("brand", { isActive: true, brand: { $nin: [null, ""] } }),
    Product.distinct("dietaryLifestyle", { isActive: true }),
    Category.find().select("name slug").sort({ order: 1, name: 1 }),
  ]);

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
    facets: {
      brands: brands.filter((value): value is string => typeof value === "string" && Boolean(value.trim())).sort((a, b) => a.localeCompare(b)),
      dietaryLifestyle: dietaryOptions.filter((value): value is string => typeof value === "string" && Boolean(value.trim())).sort((a, b) => a.localeCompare(b)),
      categories,
    },
  });
});

// Public merchandising shelves contain product data only; no customer or revenue data is exposed.
export const getProductPromotions = asyncHandler(async (_req: Request, res: Response) => {
  const [newArrivals, sales, bestSellers] = await Promise.all([
    Product.find({ isActive: true, createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } }).populate("category", "name slug icon").sort({ createdAt: -1 }).limit(6),
    Product.find({ isActive: true, $expr: { $gt: ["$compareAtPrice", "$price"] } }).populate("category", "name slug icon").sort({ compareAtPrice: -1 }).limit(6),
    Order.aggregate([
      { $match: { paymentStatus: "paid", status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", units: { $sum: "$items.quantity" } } },
      { $sort: { units: -1 } }, { $limit: 6 },
    ]),
  ]);
  const ids = bestSellers.map((row) => row._id);
  const products = ids.length ? await Product.find({ _id: { $in: ids }, isActive: true }).populate("category", "name slug icon") : [];
  const byId = new Map(products.map((product) => [product._id.toString(), product]));
  res.json({ newArrivals, trending: ids.map((id) => byId.get(id.toString())).filter(Boolean), megaSales: sales });
});

// @route GET /api/products/:slug
export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    "category",
    "name slug icon"
  );
  if (!product) return res.status(404).json({ message: "Product not found." });

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(8);

  res.json({ product, related });
});

// @route POST /api/products (admin)
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, category, price, compareAtPrice, unit, image, images, stock, lowStockThreshold, brand, dietaryLifestyle, isFeatured } =
    req.body;

  if (!name || !description || !category || price === undefined || !image) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }

  let slug = slugify(name, { lower: true });
  const clash = await Product.findOne({ slug });
  if (clash) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const product = await Product.create({
    name,
    slug,
    description,
    category,
    price,
    compareAtPrice: compareAtPrice || undefined,
    unit: unit || "1 piece",
    image,
    images: images || [],
    stock: stock ?? 0,
    lowStockThreshold: lowStockThreshold ?? 5,
    brand,
    dietaryLifestyle: Array.isArray(dietaryLifestyle) ? dietaryLifestyle : [],
    isFeatured: !!isFeatured,
  });

  if (product.stock > 0) await recordInventoryMovement({ product: product._id, actor: req.user!._id, kind: "initial_stock", before: 0, after: product.stock, note: "Initial stock entered with product creation." });
  await recordAudit(req, "product.created", "product", product._id.toString(), `Created product ${product.name}.`);

  res.status(201).json(product);
});

// @route PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const fields = [
    "name",
    "description",
    "category",
    "price",
    "compareAtPrice",
    "unit",
    "image",
    "images",
    "stock",
    "lowStockThreshold",
    "brand",
    "dietaryLifestyle",
    "isFeatured",
    "isActive",
  ] as const;

  const previousStock = product.stock;
  const changedFields = fields.filter((field) => req.body[field] !== undefined);
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      (product as any)[field] = req.body[field];
    }
  });

  if (req.body.name) {
    product.slug = slugify(req.body.name, { lower: true });
  }

  await product.save();
  if (product.stock !== previousStock) await recordInventoryMovement({ product: product._id, actor: req.user!._id, kind: "stock_adjustment", before: previousStock, after: product.stock, note: "Stock adjusted by staff." });
  await recordAudit(req, "product.updated", "product", product._id.toString(), `Updated product fields: ${changedFields.join(", ")}.`);
  res.json(product);
});

// @route DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });
  await recordAudit(req, "product.deleted", "product", product._id.toString(), `Deleted product ${product.name}.`);
  res.json({ message: "Product deleted." });
});

// @route GET /api/products/admin/all (admin) - includes inactive/out-of-stock, simple list for the dashboard table
export const getAdminProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find().populate("category", "name").sort({ createdAt: -1 });
  res.json(products);
});
