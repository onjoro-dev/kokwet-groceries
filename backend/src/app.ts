import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import { notFound, errorHandler } from "./middleware/errorHandler";

const app: Application = express();

// --- Core middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads"), { maxAge: "1d", immutable: true }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Health check ---
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "KOKWET Groceries API" });
});

// --- Feature routes ---
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
