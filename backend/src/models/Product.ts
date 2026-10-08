import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  price: number;
  compareAtPrice?: number; // original price, shown crossed-out when on offer
  unit: string; // e.g. "1 kg", "500 ml", "1 piece"
  image: string;
  images: string[];
  stock: number;
  lowStockThreshold: number;
  brand?: string;
  dietaryLifestyle: string[];
  isFeatured: boolean;
  isActive: boolean;
  ratingAverage: number;
  ratingCount: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    unit: { type: String, required: true, default: "1 piece" },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    brand: { type: String },
    dietaryLifestyle: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index powers the search bar (name + description + brand).
productSchema.index({ name: "text", description: "text", brand: "text" });

export default mongoose.model<IProduct>("Product", productSchema);
