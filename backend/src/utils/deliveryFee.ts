/**
 * Calculates the delivery fee for an order.
 * Orders above the free-delivery threshold ship free; everything else pays the standard fee.
 * Change the numbers in your .env file, not here.
 */
export const calculateDeliveryFee = (itemsTotal: number): number => {
  const freeThreshold = Number(process.env.FREE_DELIVERY_THRESHOLD) || 3000;
  const standardFee = Number(process.env.STANDARD_DELIVERY_FEE) || 150;
  return itemsTotal >= freeThreshold ? 0 : standardFee;
};
