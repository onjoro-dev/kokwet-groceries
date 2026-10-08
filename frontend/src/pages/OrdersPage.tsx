import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Order } from "../types";
import { getMyOrders } from "../services/orderService";
import { formatKES } from "../utils";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

const STATUS_LABELS: Record<string, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, "green" | "orange" | "gray" | "red"> = {
  pending: "gray",
  confirmed: "orange",
  preparing: "orange",
  out_for_delivery: "orange",
  delivered: "green",
  cancelled: "red",
};

/** Order history for the logged-in shopper — the "My orders" page. */
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        slot="emptyOrders"
        title="No orders yet"
        description="Once you place an order, it will show up here so you can track it."
        action={
          <Link to="/">
            <Button>Start shopping</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-5">My orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block border border-gray-100 rounded-xl shadow-card p-4 hover:border-brand-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">{order.orderNumber}</span>
              <Badge color={STATUS_COLORS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
              <span>{new Date(order.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span className="font-semibold text-brand-700">{formatKES(order.grandTotal)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{order.items.length} item(s) · {order.deliveryAddress.area}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
