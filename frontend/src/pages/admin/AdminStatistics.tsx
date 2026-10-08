import { useEffect, useState } from "react";
import { getBusinessStats } from "../../services/adminService";
import { formatKES } from "../../utils";

type Stats = Awaited<ReturnType<typeof getBusinessStats>>;

export default function AdminStatistics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getBusinessStats().then(setStats).catch((e) => setError(e.message)); }, []);
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!stats) return <p className="py-12 text-center text-gray-500">Loading business records...</p>;
  const max = Math.max(...stats.daily.map((day) => day.revenue), 1);
  const totalOrders = stats.orders.reduce((sum, entry) => sum + entry.count, 0);
  return <div><h1 className="text-xl font-bold text-gray-800">Business statistics</h1><p className="mb-5 mt-1 text-sm text-gray-500">Paid financial records and sales activity from your orders.</p>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Metric label="Paid revenue" value={formatKES(stats.revenue.total)} /><Metric label="Payments received" value={String(stats.revenue.count)} /><Metric label="Total orders" value={String(totalOrders)} /></div>
    <section className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-card"><h2 className="mb-1 font-bold">Daily paid sales</h2><p className="mb-4 text-xs text-gray-500">Last 30 days · KES</p>{stats.daily.length === 0 ? <p className="text-sm text-gray-500">Paid sales will appear here.</p> : <div className="flex h-48 items-end gap-1 overflow-x-auto border-b border-l p-2">{stats.daily.map((day) => <div key={day._id} className="group flex h-full min-w-5 flex-1 flex-col justify-end" title={`${day._id}: ${formatKES(day.revenue)} (${day.orders} orders)`}><div className="w-full rounded-t bg-brand-600" style={{ height: `${Math.max((day.revenue / max) * 100, 2)}%` }} /><span className="mt-1 -rotate-45 origin-top-left whitespace-nowrap text-[9px] text-gray-400">{day._id.slice(5)}</span></div>)}</div>}</section>
    <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-xl border border-gray-100 bg-white shadow-card"><h2 className="border-b p-4 font-bold">Fast moving products</h2>{stats.topProducts.length === 0 ? <p className="p-4 text-sm text-gray-500">Product sales will appear after orders are placed.</p> : stats.topProducts.map((item, index) => <div key={item._id} className="flex items-center justify-between border-b p-3 last:border-0"><span className="text-sm"><span className="mr-2 text-gray-400">{index + 1}.</span>{item.name}</span><span className="text-right text-sm font-semibold">{item.units} units<p className="text-xs font-normal text-gray-500">{formatKES(item.sales)}</p></span></div>)}</section>
      <section className="rounded-xl border border-gray-100 bg-white shadow-card"><h2 className="border-b p-4 font-bold">Low stock alerts</h2>{stats.lowStock.length === 0 ? <p className="p-4 text-sm text-gray-500">No products are below their alert levels.</p> : stats.lowStock.map((item) => <div key={item._id} className="flex items-center justify-between border-b p-3 last:border-0"><span className="text-sm">{item.name}<p className="text-xs text-gray-500">Alert at {item.lowStockThreshold} or fewer</p></span><span className="font-bold text-orange-600">{item.stock} {item.unit}</span></div>)}</section></div>
    <section className="mt-6 rounded-xl border border-gray-100 bg-white shadow-card"><h2 className="border-b p-4 font-bold">Orders by status</h2><div className="grid gap-2 p-4 sm:grid-cols-3">{stats.orders.map((status) => <div key={status._id} className="rounded-lg bg-gray-50 p-3 text-sm capitalize">{status._id.replace(/_/g, " ")} <strong className="float-right">{status.count}</strong></div>)}</div></section>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-card"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-brand-700">{value}</p></div>; }
