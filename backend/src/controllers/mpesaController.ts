import { Request, Response } from "express";
import Order from "../models/Order";
import { asyncHandler } from "../middleware/asyncHandler";
import { callbackMetadata, mpesaResponseSummary, queryStkPush, validCallbackToken } from "../services/mpesaService";
import { recordAudit } from "../utils/audit";
import { releaseOrderInventory } from "../utils/releaseOrderInventory";

export const mpesaCallback = asyncHandler(async (req: Request, res: Response) => {
  if (!validCallbackToken(typeof req.query.token === "string" ? req.query.token : undefined)) return res.status(401).json({ message: "Invalid callback token." });
  const callback = req.body?.Body?.stkCallback;
  if (!callback?.CheckoutRequestID || callback.ResultCode === undefined) return res.status(400).json({ message: "Invalid M-Pesa callback payload." });

  const checkoutRequestId = String(callback.CheckoutRequestID);
  const order = await Order.findOne({ "mpesa.checkoutRequestId": checkoutRequestId });
  if (!order) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  if (order.paymentStatus !== "pending") return res.json({ ResultCode: 0, ResultDesc: "Already processed" });

  const metadata = callbackMetadata(callback.CallbackMetadata?.Item || []);
  const resultCode = String(callback.ResultCode);
  const safeResultDescription = String(callback.ResultDesc || "").slice(0, 300);
  await Order.updateOne({ _id: order._id, paymentStatus: "pending" }, { $set: {
    "mpesa.callbackReceivedAt": new Date(),
    "mpesa.callbackHash": mpesaResponseSummary({ checkoutRequestId, resultCode, metadata }),
    "mpesa.resultCode": resultCode,
    "mpesa.resultDescription": safeResultDescription,
  } });

  if (resultCode !== "0") {
    const failed = await Order.findOneAndUpdate({ _id: order._id, paymentStatus: "pending" }, { $set: { paymentStatus: "failed" } }, { new: true });
    if (failed) {
      await releaseOrderInventory(failed._id);
      await recordAudit(req, "payment.failed", "order", failed._id.toString(), `M-Pesa payment failed for order ${failed.orderNumber}.`);
    }
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  try {
    const verification = await queryStkPush(checkoutRequestId);
    if (String(verification.ResponseCode) !== "0" || String(verification.ResultCode) !== "0") {
      throw new Error("Daraja has not confirmed this payment yet.");
    }
    const amount = metadata.Amount === undefined ? order.mpesa?.amount : Number(metadata.Amount);
    const phone = metadata.PhoneNumber === undefined ? order.mpesa?.phone : String(metadata.PhoneNumber);
    const expectedPhone = order.mpesa?.phone;
    const amountMatches = amount !== undefined && Number(amount) === Number(order.mpesa?.amount);
    const phoneMatches = !phone || !expectedPhone || String(phone).replace(/\D/g, "").endsWith(expectedPhone.replace(/\D/g, "").slice(-9));
    if (!amountMatches || !phoneMatches) {
      await Order.updateOne({ _id: order._id, paymentStatus: "pending" }, { $set: { paymentReviewRequired: true, "mpesa.resultDescription": "Daraja payment received but amount or phone did not match this order; admin review required." } });
      await recordAudit(req, "payment.review_required", "order", order._id.toString(), `M-Pesa callback needs review for order ${order.orderNumber}.`);
      return res.json({ ResultCode: 0, ResultDesc: "Accepted for review" });
    }

    const paid = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: "pending", "mpesa.checkoutRequestId": checkoutRequestId },
      { $set: {
        paymentStatus: "paid",
        paymentReviewRequired: Boolean(order.stockReleasedAt),
        "mpesa.receiptNumber": metadata.MpesaReceiptNumber ? String(metadata.MpesaReceiptNumber) : undefined,
        "mpesa.resultDescription": order.stockReleasedAt ? "Payment verified after stock was released; admin review required." : "Payment verified by M-Pesa Daraja.",
      } },
      { new: true }
    );
    if (paid) await recordAudit(req, "payment.verified", "order", paid._id.toString(), `M-Pesa payment verified for order ${paid.orderNumber}.`);
  } catch (error) {
    await Order.updateOne({ _id: order._id, paymentStatus: "pending" }, { $set: { paymentReviewRequired: true, "mpesa.resultDescription": `Callback received; Daraja verification pending: ${(error as Error).message}`.slice(0, 300) } });
    await recordAudit(req, "payment.verification_pending", "order", order._id.toString(), `Daraja verification is pending for order ${order.orderNumber}.`);
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});
