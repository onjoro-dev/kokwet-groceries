import { Types } from "mongoose";
import Order from "../models/Order";
import Product from "../models/Product";
import { recordInventoryMovement } from "./inventory";

export async function releaseOrderInventory(orderId: Types.ObjectId | string, actor?: Types.ObjectId | string) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, paymentStatus: { $ne: "paid" }, stockReleasedAt: { $exists: false } },
    { $set: { stockReleasedAt: new Date() } },
    { new: true }
  );
  if (!order) return false;
  for (const item of order.items) {
    const after = await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { new: true }).select("stock");
    if (after) await recordInventoryMovement({ product: item.product, order: order._id, actor, kind: "order_released", before: after.stock - item.quantity, after: after.stock, note: `Released reservation for ${order.orderNumber}` });
  }
  return true;
}
