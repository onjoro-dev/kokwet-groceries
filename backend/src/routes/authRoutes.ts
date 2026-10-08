import { Router } from "express";
import { registerUser, loginUser, getMe, updateProfile, getSocialConfig, socialLogin, socialCallback, saveAddress, getStaff, createStaff } from "../controllers/authController";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.get("/social/config", getSocialConfig);
router.get("/social/:provider", socialLogin);
router.get("/social/:provider/callback", socialCallback);
router.put("/addresses", protect, saveAddress);
router.get("/staff", protect, adminOnly, getStaff);
router.post("/staff", protect, adminOnly, createStaff);

export default router;
