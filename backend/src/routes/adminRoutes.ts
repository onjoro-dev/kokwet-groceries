import { Router } from "express";
import { getSettings, updateSettings, getBusinessStats, getAuditEvents, getInventoryMovements, getFinancialRecords } from "../controllers/adminController";
import { adminOnly, protect } from "../middleware/auth";

const router = Router();
router.get("/settings", getSettings);
router.put("/settings", protect, adminOnly, updateSettings);
router.get("/statistics", protect, adminOnly, getBusinessStats);
router.get("/financial-records", protect, adminOnly, getFinancialRecords);
router.get("/financial-records", protect, adminOnly, getFinancialRecords);
router.get("/activity", protect, adminOnly, getAuditEvents);
router.get("/inventory-movements", protect, adminOnly, getInventoryMovements);
export default router;
