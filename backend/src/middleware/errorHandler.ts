import { Request, Response, NextFunction } from "express";

/** Catches unknown routes and hands them to the error handler as a 404. */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central error handler. Every controller can just `throw` or call `next(error)`
 * and it lands here with a consistent JSON shape instead of leaking a stack trace to users.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err as Error & { status?: number }).status || 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong on our end.",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
