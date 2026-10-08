import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Order, OrderStatus } from "../../types";
import { getAllOrders, updateOrderStatus, confirmMpesaPayment } from "../../services/orderService";
import { formatKES } from "../../utils";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";

const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const STATUS_COLORS: Record<OrderStatus, "green" | "orange" | "gray" | "red"> = {
  pending: "gray",
  confirmed: "orange",
  preparing: "orange",
  out_for_delivery: "orange",
  delivered: "green",
  cancelled: "red",
};

/**
 * Order management screen: see every order and move it forward with one tap
 * (Confirm → Preparing → Out for delivery → Delivered), or cancel it.
 */
export default function AdminOrders() {
  const { user } = useAuth();
  const isDeliveryOfficer = user?.role === "delivery_officer";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAllOrders(filter || undefined)
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  useEffect(() => {
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, [filter]);

  const handleAdvance = async (order: Order) => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const next = isDeliveryOfficer
      ? order.status === "out_for_delivery" ? "delivered" : "out_for_delivery"
      : STATUS_FLOW[currentIndex + 1];
    if (!next) return;
    setUpdatingId(order._id);
    try {
      const updated = await updateOrderStatus(order._id, next);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (order: Order) => {
    setUpdatingId(order._id);
    try {
      const updated = await updateOrderStatus(order._id, "cancelled");
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentConfirm = async (order: Order) => {
    setUpdatingId(order._id);
    try {
      const updated = await confirmMpesaPayment(order._id);
      setOrders((prev) => prev.map((current) => current._id === order._id ? updated : current));
    } finally { setUpdatingId(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{isDeliveryOfficer ? "Ready and active deliveries" : "Orders"}</h1>
          <p className="text-sm text-gray-500">{orders.length} order(s)</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">All statuses</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState slot="emptyOrders" icon="🧾" title="No orders found" description="Orders will appear here as customers check out." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const customer = typeof order.user === "object" ? order.user : null;
            const nextStatus = isDeliveryOfficer
              ? order.status === "out_for_delivery" ? "delivered" : "out_for_delivery"
              : STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
            const isFinal = order.status === "delivered" || order.status === "cancelled";

            return (
              <div key={order._id} className="bg-white border border-gray-100 rounded-xl shadow-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-800">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <Badge color={STATUS_COLORS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
                </div>

                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Customer</p>
                    <p className="text-gray-700 font-medium">{customer?.name || "—"}</p>
                    <p className="text-gray-500">{order.deliveryAddress.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Delivering to</p>
                    <p className="text-gray-700 font-medium">{order.deliveryAddress.area}</p>
                    {order.deliveryAddress.landmark && (
                      <p className="text-gray-500">{order.deliveryAddress.landmark}</p>
                    )}
                    <a className="mt-1 inline-block font-semibold text-brand-700 hover:underline" target="_blank" rel="noreferrer" href={order.deliveryAddress.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.deliveryAddress.landmark}, ${order.deliveryAddress.area}`)}`}>Open route in Google Maps ↗</a>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {order.items.length} item(s) · M-Pesa · {order.paymentStatus}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3"><span className="font-bold text-brand-700">{formatKES(order.grandTotal)}</span><Link to={`/admin/receipts/${order._id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-700" aria-label={`Open receipt for ${order.orderNumber}`}><FileText size={14} /> Receipt</Link></div>
                  {!isFinal && (
                    <div className="flex gap-3">
                      {!isDeliveryOfficer && <button
                        onClick={() => handleCancel(order)}
                        disabled={updatingId === order._id}
                        className="text-sm font-semibold text-red-500 hover:underline disabled:opacity-50"
                      >
                        Cancel order
                      </button>}
                      {nextStatus && (
                        <button
                          onClick={() => handleAdvance(order)}
                          disabled={updatingId === order._id}
                          className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-lg disabled:opacity-50"
                        >
                          {updatingId === order._id ? "Updating..." : `Mark as: ${STATUS_LABELS[nextStatus]}`}
                        </button>
                      )}
                    </div>
                  )}
                  {user?.role === "admin" && order.paymentStatus !== "paid" && <button onClick={() => handlePaymentConfirm(order)} disabled={updatingId === order._id} className="text-sm font-semibold text-brand-700 hover:underline disabled:opacity-50">Confirm M-Pesa received</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
