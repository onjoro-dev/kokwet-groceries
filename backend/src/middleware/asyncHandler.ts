import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async controller so thrown errors are forwarded to Express's error handler
 * instead of crashing the server. Saves writing try/catch in every controller.
 */
export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
