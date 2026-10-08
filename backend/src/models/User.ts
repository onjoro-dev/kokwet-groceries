import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "customer" | "admin" | "storekeeper" | "delivery_officer";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  provider?: "google" | "facebook";
  providerId?: string;
  employment?: { employeeId?: string; jobTitle?: string; startDate?: Date; salary?: number; motorcyclePlate?: string };
  addresses: {
    label: string;
    area: string;
    landmark: string;
    phone?: string;
    recipientName?: string;
    mapsUrl?: string;
    latitude?: number;
    longitude?: number;
    isDefault: boolean;
  }[];
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const addressSchema = new Schema(
  {
    label: { type: String, required: true, default: "Home" },
    area: { type: String, required: true },
    landmark: { type: String, required: true },
    phone: String,
    recipientName: String,
    mapsUrl: String,
    latitude: Number,
    longitude: Number,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    phone: { type: String },
    role: { type: String, enum: ["customer", "admin", "storekeeper", "delivery_officer"], default: "customer" },
    provider: { type: String, enum: ["google", "facebook"] },
    providerId: String,
    employment: {
      employeeId: String,
      jobTitle: String,
      startDate: Date,
      salary: Number,
      motorcyclePlate: String,
    },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

// Hash the password automatically whenever it changes.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return this.password ? bcrypt.compare(candidate, this.password) : Promise.resolve(false);
};

export default mongoose.model<IUser>("User", userSchema);
