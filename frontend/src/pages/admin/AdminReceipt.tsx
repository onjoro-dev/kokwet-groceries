import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { useParams } from "react-router-dom";
import { downloadOrderReceipt } from "../../services/orderService";
import { getOrderById } from "../../services/orderService";
import { formatKES } from "../../utils";
import Spinner from "../../components/ui/Spinner";
import type { Order } from "../../types";

export default function AdminReceipt() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then(setOrder).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-16"><Spinner size={32} /></div>;
  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!order) return <p className="text-sm text-gray-500">Order not found.</p>;

  const download = async () => {
    try { await downloadOrderReceipt(id!); } catch (e) { setError(e instanceof Error ? e.message : "Could not create receipt."); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Receipt preview</p><h1 className="text-2xl font-extrabold">{order.orderNumber}</h1></div>
        <div className="flex gap-2"><button onClick={download} className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800"><Download size={17} /> Download receipt</button><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700"><Printer size={17} /> Print</button></div>
      </div>
      <article className="print-card rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-9">
        <div className="border-b border-dashed border-gray-300 pb-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-700">KOKWET Groceries</p><h2 className="mt-2 text-2xl font-black text-gray-900">Official receipt</h2><p className="mt-1 text-sm text-gray-500">Kitale Town, Kenya</p></div>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div><p className="text-xs font-bold uppercase text-gray-400">Receipt number</p><p className="font-semibold">{order.orderNumber}</p></div><div className="sm:text-right"><p className="text-xs font-bold uppercase text-gray-400">Issued</p><p className="font-semibold">{new Date(order.createdAt).toLocaleString("en-KE")}</p></div></div>
        <div className="mt-5 space-y-3 border-y border-gray-200 py-5 text-sm"><div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-semibold">{order.deliveryAddress.recipientName}</span></div><div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-semibold">{order.deliveryAddress.phone}</span></div><div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="font-semibold">{order.deliveryAddress.area}</span></div></div>
        <div className="mt-5 space-y-3">{order.items.map((item) => <div key={`${item.product}-${item.name}`} className="flex justify-between gap-4 text-sm"><span>{item.quantity} × {item.name} ({item.unit})</span><span className="font-semibold">{formatKES(item.price * item.quantity)}</span></div>)}</div>
        <div className="mt-6 space-y-2 border-t border-dashed border-gray-300 pt-5 text-sm"><div className="flex justify-between text-gray-500"><span>Items subtotal</span><span>{formatKES(order.itemsTotal)}</span></div><div className="flex justify-between text-gray-500"><span>Delivery fee</span><span>{formatKES(order.deliveryFee)}</span></div><div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-black"><span>Total paid</span><span>{formatKES(order.grandTotal)}</span></div></div>
        <p className="mt-6 text-center text-xs text-gray-500">Payment status: {order.paymentStatus} · {order.paymentMethod.toUpperCase()} · {order.mpesa?.receiptNumber || "M-Pesa transaction recorded"}</p>
      </article>
    </div>
  );
}
