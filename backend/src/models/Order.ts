import mongoose, { Schema, Document, Types } from "mongoose";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "mpesa";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number; // price at time of order (protects against later price changes)
  unit: string;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  deliveryAddress: {
    area: string;
    landmark: string;
    phone: string;
    recipientName: string;
  };
  itemsTotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: Date }[];
  notes?: string;
  mpesa?: {
    phone?: string;
    amount?: number;
    merchantRequestId?: string;
    checkoutRequestId?: string;
    resultCode?: string;
    resultDescription?: string;
    receiptNumber?: string;
    initiatedAt?: Date;
    callbackReceivedAt?: Date;
    callbackHash?: string;
  };
  stockReleasedAt?: Date;
  paymentReviewRequired: boolean;
  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    deliveryAddress: {
      area: { type: String, required: true },
      landmark: { type: String, required: true },
      phone: { type: String, required: true },
      recipientName: { type: String, required: true },
      mapsUrl: String,
      latitude: Number,
      longitude: Number,
    },
    itemsTotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["mpesa"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    statusHistory: {
      type: [{ status: String, at: Date }],
      default: [{ status: "pending", at: new Date() }],
    },
    notes: { type: String },
    mpesa: {
      phone: String,
      amount: Number,
      merchantRequestId: String,
      checkoutRequestId: { type: String, index: true, sparse: true },
      resultCode: String,
      resultDescription: String,
      receiptNumber: String,
      initiatedAt: Date,
      callbackReceivedAt: Date,
      callbackHash: String,
    },
    stockReleasedAt: Date,
    paymentReviewRequired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", orderSchema);
