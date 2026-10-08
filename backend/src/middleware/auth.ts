import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// Extend Express's Request type so `req.user` is recognised everywhere.
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Verifies the JWT sent in the Authorization header and attaches the user to the request.
 * Reject the request if the token is missing, invalid, or belongs to a deleted user.
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please log in to continue." });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "This account no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
};

/**
 * Restricts a route to admin users only. Use after `protect`.
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only." });
  }
  next();
};

export const storeStaffOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!["admin", "storekeeper"].includes(req.user?.role || "")) {
    return res.status(403).json({ message: "Store staff only." });
  }
  next();
};

export const adminOrDeliveryOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!["admin", "delivery_officer"].includes(req.user?.role || "")) {
    return res.status(403).json({ message: "Delivery staff only." });
  }
  next();
};
