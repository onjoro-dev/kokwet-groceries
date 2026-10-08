/**
 * Generates a short, human-friendly order number like "KG-240915-4821".
 * Easy for a customer to read out over the phone or on a receipt.
 */
export const generateOrderNumber = (): string => {
  const date = new Date();
  const y = date.getFullYear().toString().slice(2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `KG-${y}${m}${d}-${random}`;
};
