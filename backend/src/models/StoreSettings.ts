import mongoose, { Schema, Document } from "mongoose";

export interface IStoreSettings extends Document {
  name: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  highlightColor: string;
  visualImages: Map<string, string>;
  lowStockThreshold: number;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroCtaLabel: string;
  heroCtaLink: string;
}

const settingsSchema = new Schema<IStoreSettings>({
  name: { type: String, default: "KOKWET Groceries" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  address: { type: String, default: "Kitale Town, Kenya" },
  logoUrl: { type: String, default: "/uploads/logo.jpeg" },
  primaryColor: { type: String, default: "#006B32" },
  accentColor: { type: String, default: "#F7941D" },
  highlightColor: { type: String, default: "#FFC20E" },
  visualImages: { type: Map, of: String, default: {} },
  lowStockThreshold: { type: Number, default: 5, min: 0 },
  heroTitle: { type: String, default: "Fresh groceries, delivered to your door in Kitale" },
  heroSubtitle: { type: String, default: "From sukuma wiki to household essentials — order online and get it delivered same day." },
  heroImageUrl: { type: String, default: "" },
  heroCtaLabel: { type: String, default: "Shop fresh produce" },
  heroCtaLink: { type: String, default: "/category/fresh-produce" },
}, { timestamps: true });

export default mongoose.model<IStoreSettings>("StoreSettings", settingsSchema);
