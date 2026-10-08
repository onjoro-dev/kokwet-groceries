import { Request } from "express";
import AuditLog from "../models/AuditLog";

export async function recordAudit(req: Request, action: string, entity: string, entityId: string | undefined, summary: string) {
  try {
    await AuditLog.create({
      actor: req.user?._id,
      actorRole: req.user?.role || "system",
      action,
      entity,
      entityId,
      summary: summary.slice(0, 500),
      ip: req.ip,
      userAgent: req.get("user-agent")?.slice(0, 300),
    });
  } catch (error) {
    console.error("Audit log write failed:", (error as Error).message);
  }
}
