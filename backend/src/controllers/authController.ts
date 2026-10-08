import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { asyncHandler } from "../middleware/asyncHandler";
import { recordAudit } from "../utils/audit";
import { buildSocialUrl, getSocialProviders, SocialProvider, socialUserFromCode, validateSocialState } from "../services/oauthService";

// @route POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: "An account with this email already exists." });
  }

  const user = await User.create({ name, email, password, phone });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token: generateToken(user._id.toString()),
  });
});

// @route POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token: generateToken(user._id.toString()),
  });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json(req.user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { name, email, phone, password } = req.body;
  if (name !== undefined && !String(name).trim()) return res.status(400).json({ message: "Name is required." });
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return res.status(400).json({ message: "Enter a valid email address." });
  if (phone !== undefined && !String(phone).trim()) return res.status(400).json({ message: "Phone number is required." });
  if (password !== undefined && String(password).length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

  const duplicate = await User.findOne({ email: email?.toLowerCase(), _id: { $ne: user._id } });
  if (duplicate) return res.status(409).json({ message: "That email is already in use." });

  if (name !== undefined) user.name = String(name).trim();
  if (email !== undefined) user.email = String(email).toLowerCase().trim();
  if (phone !== undefined) user.phone = String(phone).trim();
  if (password !== undefined) user.password = String(password);
  await user.save();
  await recordAudit(req, "profile.updated", "user", user._id.toString(), "Updated the current user's profile.");
  res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
});

export const getSocialConfig = (_req: Request, res: Response) => res.json(getSocialProviders());

export const socialLogin = asyncHandler(async (req: Request, res: Response) => {
  const provider = req.params.provider as SocialProvider;
  if (!['google', 'facebook'].includes(provider)) return res.status(400).json({ message: "Unsupported social provider." });
  const redirect = buildSocialUrl(provider);
  if (!redirect) return res.status(503).json({ message: "Social login is not configured." });
  res.redirect(redirect.url);
});

export const socialCallback = asyncHandler(async (req: Request, res: Response) => {
  const provider = req.params.provider as SocialProvider;
  if (!['google', 'facebook'].includes(provider)) return res.status(400).json({ message: "Unsupported social provider." });
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  if (!code || !validateSocialState(state)) return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=Social%20login%20failed`);
  const result = await socialUserFromCode(provider, code);
  res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/social-callback?token=${encodeURIComponent(result.token)}&role=${result.user.role}`);
});

// @route PUT /api/auth/addresses
export const saveAddress = asyncHandler(async (req: Request, res: Response) => {
  const { label, area, landmark, phone, recipientName, mapsUrl, latitude, longitude } = req.body;
  const user = req.user!;
  if (!area || !landmark?.trim() || !phone || !recipientName) {
    return res.status(400).json({ message: "Name, phone, area and a landmark are required." });
  }
  user.addresses = [{ label: label || "Home", area, landmark: landmark.trim(), phone, recipientName, mapsUrl, latitude, longitude, isDefault: true }];
  await user.save();
  res.status(201).json(user.addresses);
});

export const getStaff = asyncHandler(async (_req: Request, res: Response) => {
  const staff = await User.find({ role: { $in: ["storekeeper", "delivery_officer"] } }).select("name email phone role employment createdAt").sort({ createdAt: -1 });
  res.json(staff.map((member) => ({ ...member.toObject(), loginPath: member.role === "storekeeper" ? "/staff/storekeeper/login" : "/staff/delivery-officer/login" })));
});

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role, employment } = req.body;
  if (!name || !email || !password || !phone || !["storekeeper", "delivery_officer"].includes(role)) {
    return res.status(400).json({ message: "Complete all staff details and choose a valid staff role." });
  }
  if (role === "delivery_officer" && !employment?.motorcyclePlate) {
    return res.status(400).json({ message: "A motorcycle plate number is required for delivery officers." });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "An account with this email already exists." });
  const staff = await User.create({ name, email, password, phone, role, employment });
  await recordAudit(req, "staff.created", "user", staff._id.toString(), `Created ${staff.role} account for ${staff.name}.`);
  res.status(201).json({ _id: staff._id, name: staff.name, email: staff.email, phone: staff.phone, role: staff.role, employment: staff.employment, createdAt: staff.createdAt, loginPath: role === "storekeeper" ? "/staff/storekeeper/login" : "/staff/delivery-officer/login" });
});
