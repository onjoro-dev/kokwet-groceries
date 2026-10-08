const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function resolveMediaUrl(url?: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  try { return new URL(url, `${new URL(API_ROOT).origin}/`).toString(); }
  catch { return url; }
}
