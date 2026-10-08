import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Order } from "../types";
import { getOrderById } from "../services/orderService";
import { formatKES } from "../utils";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import BrandVisual from "../components/ui/BrandVisual";

/** Shown right after an order is placed — confirms it went through and gives a clear order number to reference. */
export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    let polls = 0;
    getOrderById(id).then((value) => {
      if (!active) return;
      setOrder(value);
      if (value.paymentStatus === "pending" && value.mpesa?.checkoutRequestId) {
        timer = setInterval(async () => {
          polls += 1;
          try {
            const refreshed = await getOrderById(id);
            if (!active) return;
            setOrder(refreshed);
            if (refreshed.paymentStatus !== "pending" || polls >= 30) { if (timer) clearInterval(timer); }
          } catch { if (polls >= 30 && timer) clearInterval(timer); }
        }, 5000);
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; if (timer) clearInterval(timer); };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={32} />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center py-24 text-gray-500">We couldn't find that order.</p>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <BrandVisual slot="orderSuccess" fallback="✅" className="mx-auto mb-4 h-16 w-16 text-5xl" imageClassName="h-full w-full rounded-lg object-cover" />
      <h1 className="text-xl font-bold text-gray-800">Order placed!</h1>
      <p className="text-gray-500 mt-2">
        {order.paymentStatus === "paid" ? "M-Pesa payment confirmed. Thank you for your order." : order.paymentStatus === "failed" ? "The M-Pesa request did not complete. Please contact the store before placing another order." : order.mpesa?.checkoutRequestId ? `An M-Pesa prompt was sent to ${order.mpesa.phone || "your phone"}. Enter your PIN to complete payment; this page will update automatically.` : "Your order was saved, but automatic M-Pesa is not configured in this environment. Please contact the store for payment instructions."}
      </p>

      <div className="mt-6 border border-gray-100 rounded-xl shadow-card p-5 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Order number</span>
          <span className="font-bold text-brand-700">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Payment status</span><span className={`font-semibold ${order.paymentStatus === "paid" ? "text-green-700" : order.paymentStatus === "failed" ? "text-red-600" : "text-orange-600"}`}>{order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "failed" ? "Failed" : "Awaiting payment"}</span></div>
        {order.mpesa?.receiptNumber && <div className="flex justify-between text-sm"><span className="text-gray-500">M-Pesa receipt</span><span className="font-semibold text-gray-800">{order.mpesa.receiptNumber}</span></div>}
        {order.paymentReviewRequired && <p className="pt-2 text-xs text-amber-700">The store is reviewing this payment. Your order status will update after review.</p>}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Delivering to</span>
          <span className="font-medium text-gray-800">{order.deliveryAddress.area}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Payment method</span>
          <span className="font-medium text-gray-800">
            M-Pesa
          </span>
        </div>
        <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>{formatKES(order.grandTotal)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/orders/${order._id}`}>
          <Button variant="outline" fullWidth>
            Track this order
          </Button>
        </Link>
        <Link to="/">
          <Button fullWidth>Continue shopping</Button>
        </Link>
      </div>
    </div>
  );
}
