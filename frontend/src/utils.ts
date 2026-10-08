// Small formatting helpers used across the app.

/** Formats a number as Kenyan Shillings, e.g. formatKES(1250) -> "KSh 1,250" */
export const formatKES = (amount: number): string =>
  `KSh ${Math.round(amount).toLocaleString("en-KE")}`;

/** Returns a 0-100 discount percentage when a compareAtPrice exists, else null. */
export const discountPercent = (price: number, compareAtPrice?: number): number | null => {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};
