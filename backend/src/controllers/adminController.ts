import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import Order from "../models/Order";
import Product from "../models/Product";
import StoreSettings from "../models/StoreSettings";
import AuditLog from "../models/AuditLog";
import { recordAudit } from "../utils/audit";
import InventoryMovement from "../models/InventoryMovement";

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await StoreSettings.findOne() || await StoreSettings.create({});
  let changed = false;
  if (!settings.logoUrl) { settings.logoUrl = "/uploads/logo.jpeg"; changed = true; }
  if (["#15803d", "#1f7f3f"].includes(settings.primaryColor.toLowerCase())) { settings.primaryColor = "#006B32"; changed = true; }
  if (["#f97316", "#f5821f"].includes(settings.accentColor.toLowerCase())) { settings.accentColor = "#F7941D"; changed = true; }
  if (!(settings as any).highlightColor) { (settings as any).highlightColor = "#FFC20E"; changed = true; }
  if (changed) await settings.save();
  res.json(settings.toObject({ flattenMaps: true }));
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const allowed = ["name", "phone", "email", "address", "logoUrl", "primaryColor", "accentColor", "highlightColor", "visualImages", "lowStockThreshold", "heroTitle", "heroSubtitle", "heroImageUrl", "heroCtaLabel", "heroCtaLink"];
  const values = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
  if (typeof values.heroCtaLink === "string" && (!values.heroCtaLink.startsWith("/") || values.heroCtaLink.startsWith("//"))) {
    return res.status(400).json({ message: "The hero button must link to a page within the store." });
  }
  const settings = await StoreSettings.findOneAndUpdate({}, { $set: values }, { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true });
  if (req.body.lowStockThreshold !== undefined) {
    await Product.updateMany({}, { $set: { lowStockThreshold: Number(req.body.lowStockThreshold) } });
  }
  await recordAudit(req, "settings.updated", "store_settings", String(settings._id), `Updated store settings: ${Object.keys(values).join(", ")}.`);
  res.json(settings.toObject({ flattenMaps: true }));
});

export const getAuditEvents = asyncHandler(async (_req: Request, res: Response) => {
  const events = await AuditLog.find().populate("actor", "name role").sort({ createdAt: -1 }).limit(100);
  res.json(events);
});

export const getInventoryMovements = asyncHandler(async (_req: Request, res: Response) => {
  const movements = await InventoryMovement.find().populate("product", "name unit").populate("order", "orderNumber").populate("actor", "name role").sort({ createdAt: -1 }).limit(100);
  res.json(movements);
});

export const getBusinessStats = asyncHandler(async (_req: Request, res: Response) => {
  const [orders, revenue, topProducts, lowStock] = await Promise.all([
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $unwind: "$items" }, { $group: { _id: "$items.product", name: { $first: "$items.name" }, units: { $sum: "$items.quantity" }, sales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } }, { $sort: { units: -1 } }, { $limit: 10 }]),
    Product.find({ $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] } }).select("name stock lowStockThreshold unit").sort({ stock: 1 }),
  ]);
  const daily = await Order.aggregate([{ $match: { paymentStatus: "paid", createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$grandTotal" }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  res.json({ orders, revenue: revenue[0] || { total: 0, count: 0 }, topProducts, lowStock, daily });
});

export const getFinancialRecords = asyncHandler(async (_req: Request, res: Response) => {
  const records = await Order.find({ paymentStatus: "paid" }).populate("user", "name email phone").sort({ createdAt: -1 });
  const totals = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, revenue: { $sum: "$grandTotal" }, orders: { $sum: 1 }, deliveryFees: { $sum: "$deliveryFee" } } },
  ]);
  const itemCount = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $unwind: "$items" },
    { $group: { _id: null, items: { $sum: "$items.quantity" } } },
  ]);
  res.json({ records, totals: { ...(totals[0] || { revenue: 0, orders: 0, deliveryFees: 0 }), items: itemCount[0]?.items || 0 } });
});
