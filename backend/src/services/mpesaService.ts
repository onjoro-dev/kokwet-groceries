import { createHash, timingSafeEqual } from "crypto";

type MpesaApiResponse = Record<string, any>;
let cachedToken: { value: string; expiresAt: number } | null = null;

export function mpesaConfigured() {
  return Boolean(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_SHORTCODE && process.env.MPESA_PASSKEY && process.env.MPESA_CALLBACK_URL && (process.env.MPESA_CALLBACK_SECRET || "").length >= 32);
}

function apiRoot() {
  return process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}

async function accessToken() {
  if (!mpesaConfigured()) throw new Error("M-Pesa Daraja is not configured. Set its credentials and public callback URL in backend/.env.");
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;
  const credentials = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
  const response = await fetch(`${apiRoot()}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${credentials}` } });
  const data = await response.json() as MpesaApiResponse;
  if (!response.ok || !data.access_token) throw new Error(data.errorMessage || "Could not authorize with M-Pesa Daraja.");
  cachedToken = { value: data.access_token, expiresAt: Date.now() + Math.max(60, Number(data.expires_in) || 3599) * 1000 };
  return cachedToken.value;
}

export function normalizeMpesaPhone(value: string) {
  const digits = String(value || "").replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  throw new Error("Enter a valid Kenyan M-Pesa number, such as 0712345678.");
}

function mpesaTimestamp() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}${value.month}${value.day}${value.hour}${value.minute}${value.second}`;
}

function stkPassword(timestamp: string) {
  return Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");
}

async function postJson(path: string, body: Record<string, unknown>) {
  const token = await accessToken();
  const response = await fetch(`${apiRoot()}${path}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json() as MpesaApiResponse;
  if (!response.ok) throw new Error(data.errorMessage || data.error_description || "M-Pesa request failed.");
  return data;
}

export async function initiateStkPush(input: { phone: string; amount: number; orderNumber: string }) {
  const phone = normalizeMpesaPhone(input.phone);
  const timestamp = mpesaTimestamp();
  const callback = new URL(process.env.MPESA_CALLBACK_URL!);
  if (process.env.MPESA_ENV === "production" && callback.protocol !== "https:") throw new Error("The production M-Pesa callback URL must use HTTPS.");
  if ((process.env.MPESA_CALLBACK_SECRET || "").length < 32) throw new Error("MPESA_CALLBACK_SECRET must be at least 32 characters.");
  callback.searchParams.set("token", process.env.MPESA_CALLBACK_SECRET!);
  const result = await postJson("/mpesa/stkpush/v1/processrequest", {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: stkPassword(timestamp),
    Timestamp: timestamp,
    TransactionType: process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline",
    Amount: Math.round(input.amount),
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: callback.toString(),
    AccountReference: input.orderNumber.slice(0, 12),
    TransactionDesc: `Kokwet order ${input.orderNumber}`.slice(0, 20),
  });
  if (String(result.ResponseCode) !== "0" || !result.CheckoutRequestID) throw new Error(result.ResponseDescription || "M-Pesa did not accept the payment request.");
  return { phone, merchantRequestId: String(result.MerchantRequestID || ""), checkoutRequestId: String(result.CheckoutRequestID), customerMessage: String(result.CustomerMessage || "Check your phone and enter your M-Pesa PIN to pay.") };
}

export async function queryStkPush(checkoutRequestId: string) {
  const timestamp = mpesaTimestamp();
  return postJson("/mpesa/stkpushquery/v1/query", {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: stkPassword(timestamp),
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  });
}

export function validCallbackToken(provided: string | undefined) {
  const expected = process.env.MPESA_CALLBACK_SECRET;
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function callbackMetadata(items: Array<{ Name: string; Value?: unknown }> = []) {
  return Object.fromEntries(items.map((item) => [item.Name, item.Value]));
}

export function mpesaResponseSummary(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 12);
}
