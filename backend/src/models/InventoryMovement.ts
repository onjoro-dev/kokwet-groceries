import mongoose, { Schema, Document, Types } from "mongoose";

export type InventoryMovementKind = "initial_stock" | "order_reserved" | "order_released" | "stock_adjustment";

export interface IInventoryMovement extends Document {
  product: Types.ObjectId;
  order?: Types.ObjectId;
  actor?: Types.ObjectId;
  kind: InventoryMovementKind;
  delta: number;
  before: number;
  after: number;
  note?: string;
  createdAt: Date;
}

const inventoryMovementSchema = new Schema<IInventoryMovement>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  order: { type: Schema.Types.ObjectId, ref: "Order", index: true },
  actor: { type: Schema.Types.ObjectId, ref: "User" },
  kind: { type: String, enum: ["initial_stock", "order_reserved", "order_released", "stock_adjustment"], required: true },
  delta: { type: Number, required: true },
  before: { type: Number, required: true, min: 0 },
  after: { type: Number, required: true, min: 0 },
  note: String,
}, { timestamps: { createdAt: true, updatedAt: false } });

inventoryMovementSchema.index({ createdAt: -1 });
export default mongoose.model<IInventoryMovement>("InventoryMovement", inventoryMovementSchema);
