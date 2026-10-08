import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  confirmMpesaPayment,
  getOrderReceipt,
} from "../controllers/orderController";
import { protect, adminOnly, adminOrDeliveryOnly } from "../middleware/auth";
import { mpesaCallback } from "../controllers/mpesaController";

const router = Router();

router.post("/mpesa/callback", mpesaCallback);
router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/admin/stats", protect, adminOnly, getOrderStats);
router.put("/:id/payment", protect, adminOnly, confirmMpesaPayment);
router.get("/", protect, adminOrDeliveryOnly, getAllOrders);
router.get("/:id", protect, getOrderById);
router.get("/:id/receipt", protect, getOrderReceipt);
router.put("/:id/status", protect, adminOrDeliveryOnly, updateOrderStatus);

export default router;
