import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Order, OrderStatus } from "../types";
import { getOrderById } from "../services/orderService";
import { formatKES } from "../utils";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";

const STEPS: OrderStatus[] = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];
const STEP_LABELS: Record<OrderStatus, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Detailed tracking view for a single order — shows a visual progress tracker plus the full receipt. */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getOrderById(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center py-16 text-gray-500">Order not found.</p>;
  }

  const currentStepIndex = STEPS.indexOf(order.status);
  const cancelled = order.status === "cancelled";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <Link to="/orders" className="text-sm text-brand-700 hover:underline">
        ← Back to my orders
      </Link>

      <div className="flex items-center justify-between mt-3 mb-6">
        <h1 className="text-xl font-bold text-gray-800">{order.orderNumber}</h1>
        {cancelled && <Badge color="red">Cancelled</Badge>}
      </div>

      {!cancelled && (
        <div className="mb-8">
          <div className="flex justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center text-center relative">
                {i > 0 && (
                  <div
                    className={`absolute top-3 right-1/2 w-full h-0.5 ${
                      i <= currentStepIndex ? "bg-brand-600" : "bg-gray-200"
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStepIndex ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i <= currentStepIndex ? "✓" : ""}
                </div>
                <span className={`text-[11px] mt-2 ${i <= currentStepIndex ? "text-brand-700 font-semibold" : "text-gray-400"}`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-gray-100 rounded-xl shadow-card p-5 space-y-4">
        <div>
          <h2 className="font-bold text-gray-800 mb-2">Items</h2>
          <ul className="space-y-2">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity} <span className="text-gray-400">({item.unit})</span>
                </span>
                <span className="font-medium text-gray-800">{formatKES(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatKES(order.itemsTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery fee</span>
            <span>{order.deliveryFee === 0 ? "Free" : formatKES(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 text-base pt-1">
            <span>Total</span>
            <span>{formatKES(order.grandTotal)}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 text-sm text-gray-600 space-y-1">
          <p><span className="text-gray-400">Delivering to:</span> {order.deliveryAddress.area}</p>
          {order.deliveryAddress.landmark && (
            <p><span className="text-gray-400">Landmark:</span> {order.deliveryAddress.landmark}</p>
          )}
          <p><span className="text-gray-400">Payment:</span> M-Pesa · {order.paymentStatus}</p>
          <a className="inline-block text-brand-700 font-semibold hover:underline" target="_blank" rel="noreferrer" href={order.deliveryAddress.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.deliveryAddress.landmark}, ${order.deliveryAddress.area}`)}`}>Open delivery point in Google Maps</a>
        </div>
      </div>
    </div>
  );
}
