import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  actor?: Types.ObjectId;
  actorRole: string;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  actor: { type: Schema.Types.ObjectId, ref: "User" },
  actorRole: { type: String, required: true },
  action: { type: String, required: true, index: true },
  entity: { type: String, required: true, index: true },
  entityId: String,
  summary: { type: String, required: true, maxlength: 500 },
  ip: String,
  userAgent: String,
}, { timestamps: { createdAt: true, updatedAt: false } });

auditLogSchema.index({ createdAt: -1 });
export default mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
