import { Request, Response } from "express";
import Order, { OrderStatus } from "../models/Order";
import Product from "../models/Product";
import { asyncHandler } from "../middleware/asyncHandler";
import { generateOrderNumber } from "../utils/orderNumber";
import { calculateDeliveryFee } from "../utils/deliveryFee";
import { recordInventoryMovement } from "../utils/inventory";
import { recordAudit } from "../utils/audit";
import { releaseOrderInventory } from "../utils/releaseOrderInventory";
import { initiateStkPush, mpesaConfigured, normalizeMpesaPhone } from "../services/mpesaService";

interface IncomingItem {
  productId: string;
  quantity: number;
}

// @route POST /api/orders
// Body: { items: [{productId, quantity}], deliveryAddress: {area, landmark, phone, recipientName}, paymentMethod, notes }
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { items, deliveryAddress, paymentMethod, notes } = req.body as {
    items: IncomingItem[];
    deliveryAddress: { area: string; landmark?: string; phone: string; recipientName: string; mapsUrl?: string; latitude?: number; longitude?: number };
    paymentMethod: "mpesa";
    notes?: string;
  };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty." });
  }
  if (!deliveryAddress?.area || !deliveryAddress?.phone || !deliveryAddress?.recipientName || !deliveryAddress?.landmark?.trim()) {
    return res.status(400).json({ message: "Please provide recipient, contact, area and a landmark." });
  }
  if (paymentMethod !== "mpesa") return res.status(400).json({ message: "M-Pesa is the only available payment method." });
  if (process.env.NODE_ENV === "production" && !mpesaConfigured()) return res.status(503).json({ message: "M-Pesa checkout is not configured yet. Please contact the store before placing an order." });
  if (mpesaConfigured()) {
    try { normalizeMpesaPhone(deliveryAddress.phone); }
    catch (error) { return res.status(400).json({ message: (error as Error).message }); }
  }

  // Re-price every item from the database — never trust prices sent from the client.
  const orderItems = [];
  const reservations: { productId: string; quantity: number; before: number }[] = [];
  let itemsTotal = 0;

  const normalizedItems = new Map<string, number>();
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!item.productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) return res.status(400).json({ message: "Check the quantities in your cart." });
    normalizedItems.set(item.productId, (normalizedItems.get(item.productId) || 0) + quantity);
  }
  try {
    for (const [productId, quantity] of normalizedItems) {
      const product = await Product.findOneAndUpdate({ _id: productId, isActive: true, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
      if (!product) {
        const current = await Product.findById(productId).select("name stock isActive");
        if (!current || !current.isActive) throw new Error("A product in your cart is no longer available.");
        throw new Error(`Only ${current.stock} of "${current.name}" left in stock.`);
      }
      reservations.push({ productId, quantity, before: product.stock + quantity });
      orderItems.push({ product: product._id, name: product.name, image: product.image, price: product.price, unit: product.unit, quantity });
      itemsTotal += product.price * quantity;
    }
  } catch (error) {
    await Promise.all(reservations.map((reservation) => Product.updateOne({ _id: reservation.productId }, { $inc: { stock: reservation.quantity } })));
    return res.status(400).json({ message: (error as Error).message });
  }

  const deliveryFee = calculateDeliveryFee(itemsTotal);
  const grandTotal = itemsTotal + deliveryFee;

  let order;
  try {
    order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user!._id,
    items: orderItems,
    deliveryAddress,
    itemsTotal,
    deliveryFee,
    grandTotal,
    paymentMethod,
    paymentStatus: "pending",
    notes,
    status: "pending",
    statusHistory: [{ status: "pending", at: new Date() }],
    });
  } catch (error) {
    await Promise.all(reservations.map((reservation) => Product.updateOne({ _id: reservation.productId }, { $inc: { stock: reservation.quantity } })));
    throw error;
  }

  await Promise.all(reservations.map((reservation) => recordInventoryMovement({ product: reservation.productId, order: order._id, actor: req.user!._id, kind: "order_reserved", before: reservation.before, after: reservation.before - reservation.quantity, note: `Reserved for ${order.orderNumber}` })));
  await recordAudit(req, "order.created", "order", order._id.toString(), `Customer created order ${order.orderNumber}.`);

  if (mpesaConfigured()) {
    try {
      const request = await initiateStkPush({ phone: deliveryAddress.phone, amount: grandTotal, orderNumber: order.orderNumber });
      order.mpesa = { phone: request.phone, amount: Math.round(grandTotal), merchantRequestId: request.merchantRequestId, checkoutRequestId: request.checkoutRequestId, initiatedAt: new Date(), resultDescription: request.customerMessage };
      await order.save();
    } catch (error) {
      order.paymentStatus = "failed";
      order.mpesa = { amount: Math.round(grandTotal), resultCode: "initiation_failed", resultDescription: (error as Error).message.slice(0, 300) };
      await order.save();
      await releaseOrderInventory(order._id);
      await recordAudit(req, "payment.initiation_failed", "order", order._id.toString(), `M-Pesa request failed for order ${order.orderNumber}.`);
    }
  } else {
    order.mpesa = { resultCode: "not_configured", resultDescription: "Automatic M-Pesa is not configured in this development environment." };
    await order.save();
  }

  res.status(201).json(order);
});

// @route GET /api/orders/mine
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @route GET /api/orders/:id
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (req.user!.role === "delivery_officer") {
    const allowed = order.status === "confirmed" || order.status === "preparing" || order.status === "out_for_delivery";
    if (!allowed) return res.status(403).json({ message: "This order is not ready for delivery." });
  }

  const isOwner = order.user.toString() === req.user!._id?.toString();
  const isStaff = ["admin", "delivery_officer"].includes(req.user!.role);
  if (!isOwner && !isStaff) {
    return res.status(403).json({ message: "You can't view this order." });
  }

  res.json(order);
});

export const getOrderReceipt = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate("user", "name email phone");
  if (!order) return res.status(404).json({ message: "Order not found." });
  const ownerId = "_id" in order.user ? String(order.user._id) : String(order.user);
  const isOwner = ownerId === req.user!._id?.toString();
  const isStaff = ["admin", "delivery_officer"].includes(req.user!.role);
  if (!isOwner && !isStaff) return res.status(403).json({ message: "You can't view this receipt." });
  res.json({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customer: order.deliveryAddress.recipientName,
    phone: order.deliveryAddress.phone,
    items: order.items,
    itemsTotal: order.itemsTotal,
    deliveryFee: order.deliveryFee,
    grandTotal: order.grandTotal,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    receiptNumber: order.mpesa?.receiptNumber || "",
  });
});

// @route GET /api/orders (admin) - all orders, newest first
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const deliveryView = req.user!.role === "delivery_officer";
  const deliveryStatuses = ["confirmed", "preparing", "out_for_delivery"];
  const filter = deliveryView
    ? { status: status && deliveryStatuses.includes(String(status)) ? String(status) : { $in: status ? [] : deliveryStatuses } }
    : status ? { status } : {};
  const orders = await Order.find(filter).populate("user", "name email phone").sort({ createdAt: -1 });
  res.json(orders);
});

// @route PUT /api/orders/:id/status (admin)
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: OrderStatus };
  const validStatuses: OrderStatus[] = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) return res.status(400).json({ message: "Choose a valid order status." });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.status === "cancelled" && status !== "cancelled") return res.status(409).json({ message: "A cancelled order cannot be reopened. Create a new order instead." });

  if (status === "confirmed" && req.user!.role === "admin" && order.paymentStatus !== "paid") {
    return res.status(400).json({ message: "Confirm the M-Pesa payment before verifying this order for delivery." });
  }

  if (req.user!.role === "delivery_officer") {
    const next = order.status === "confirmed" || order.status === "preparing" ? "out_for_delivery" : "delivered";
    if (status !== next) return res.status(403).json({ message: "Delivery officers can only mark assigned deliveries as out for delivery or delivered." });
  }

  const previousStatus = order.status;
  order.status = status;
  order.statusHistory.push({ status, at: new Date() });
  await order.save();
  if (status === "cancelled" && previousStatus !== "cancelled" && order.paymentStatus !== "paid") await releaseOrderInventory(order._id, req.user!._id);
  await recordAudit(req, "order.status_updated", "order", order._id.toString(), `Order ${order.orderNumber} changed from ${previousStatus} to ${status}.`);
  res.json(order);
});

export const confirmMpesaPayment = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== "admin") return res.status(403).json({ message: "Only an admin can confirm M-Pesa payments." });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.status === "cancelled") return res.status(409).json({ message: "A cancelled order cannot be marked paid. Review the M-Pesa transaction and refund it if needed." });
  if (order.paymentStatus === "paid") return res.json(order);
  order.paymentStatus = "paid";
  await order.save();
  await recordAudit(req, "payment.manually_confirmed", "order", order._id.toString(), `Admin manually confirmed M-Pesa for order ${order.orderNumber}.`);
  res.json(order);
});

// @route GET /api/orders/admin/stats (admin) - simple numbers for the dashboard home
export const getOrderStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalOrders, pendingOrders, deliveredOrders, revenueAgg] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ["pending", "confirmed", "preparing", "out_for_delivery"] } }),
    Order.countDocuments({ status: "delivered" }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]),
  ]);

  res.json({
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalRevenue: revenueAgg[0]?.total || 0,
  });
});
