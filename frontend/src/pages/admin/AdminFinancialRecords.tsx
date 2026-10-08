import { useEffect, useState } from "react";
import { FileText, PackageCheck, TrendingUp } from "lucide-react";
import { getFinancialRecords } from "../../services/adminService";
import { formatKES } from "../../utils";
import Spinner from "../../components/ui/Spinner";

export default function AdminFinancialRecords() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getFinancialRecords>> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getFinancialRecords().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!data) return <div className="py-16"><Spinner size={32} /></div>;

  const { records, totals } = data;
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-brand-700"><TrendingUp size={20} /><h1 className="text-2xl font-extrabold">Financial records</h1></div>
        <p className="mt-1 text-sm text-gray-500">Paid orders, revenue, item totals, and delivery fees from verified M-Pesa payments.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<TrendingUp size={20} />} label="Paid revenue" value={formatKES(totals.revenue)} tone="green" />
        <Metric icon={<FileText size={20} />} label="Paid orders" value={String(totals.orders)} tone="blue" />
        <Metric icon={<PackageCheck size={20} />} label="Items sold" value={String(totals.items)} tone="orange" />
        <Metric icon={<PackageCheck size={20} />} label="Delivery fees" value={formatKES(totals.deliveryFees)} tone="purple" />
      </div>
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="border-b px-5 py-4"><h2 className="font-extrabold text-gray-900">Paid order receipts</h2><p className="mt-1 text-xs text-gray-500">The source of truth for receipt generation and reconciliation.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Delivery fee</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Date</th></tr></thead>
            <tbody>{records.map((record) => {
              const customer = typeof record.user === "object" ? record.user : null;
              return <tr key={record._id} className="border-t"><td className="px-5 py-4 font-semibold text-brand-700">{record.orderNumber}</td><td className="px-5 py-4">{customer?.name || "Customer"}<br /><span className="text-xs text-gray-400">{customer?.phone || ""}</span></td><td className="px-5 py-4">{record.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td className="px-5 py-4">{formatKES(record.deliveryFee)}</td><td className="px-5 py-4 font-bold">{formatKES(record.grandTotal)}</td><td className="px-5 py-4">{new Date(record.createdAt).toLocaleDateString("en-KE")}</td></tr>;
            })}</tbody>
          </table>
        </div>
        {records.length === 0 && <p className="p-8 text-center text-sm text-gray-500">Paid records will appear here after a payment is confirmed.</p>}
      </section>
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "green" | "blue" | "orange" | "purple" }) {
  const tones = { green: "bg-emerald-50 text-emerald-700", blue: "bg-sky-50 text-sky-700", orange: "bg-orange-50 text-orange-700", purple: "bg-violet-50 text-violet-700" };
  return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card"><div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p></div>;
}
