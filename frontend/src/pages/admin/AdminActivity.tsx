import { useEffect, useState } from "react";
import { AuditEvent, getAuditEvents, getInventoryMovements, InventoryMovement } from "../../services/adminService";
import Spinner from "../../components/ui/Spinner";

export default function AdminActivity() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { Promise.all([getAuditEvents(), getInventoryMovements()]).then(([audit, inventory]) => { setEvents(audit); setMovements(inventory); }).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <div><h1 className="text-xl font-bold text-gray-800">Admin activity</h1><p className="mb-5 mt-1 text-sm text-gray-500">Recent staff changes to products, orders, settings, users, and payments. Personal details and passwords are not recorded here.</p>
    {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
    {loading ? <div className="flex justify-center py-16"><Spinner size={32} /></div> : events.length === 0 ? <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-card">No activity recorded yet.</div> : <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card">{events.map((event) => {
      const actor = typeof event.actor === "object" ? event.actor?.name : "System";
      return <article key={event._id} className="grid gap-2 border-b p-4 last:border-0 sm:grid-cols-[1fr_auto]"><div><p className="font-semibold text-gray-800">{event.summary}</p><p className="mt-1 text-xs text-gray-500">{event.action} · {event.entity} · {actor || event.actorRole}</p></div><time className="text-xs text-gray-400" dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time></article>;
    })}</div>}
    {!loading && <section className="mt-8"><h2 className="mb-3 font-bold text-gray-800">Inventory movement</h2>{movements.length === 0 ? <p className="rounded-xl border border-gray-100 bg-white p-5 text-sm text-gray-500">Stock reservations and adjustments will appear here.</p> : <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card">{movements.map((movement) => { const product = typeof movement.product === "object" ? movement.product.name : movement.product; const order = typeof movement.order === "object" ? movement.order?.orderNumber : movement.order; return <article key={movement._id} className="grid gap-2 border-b p-4 last:border-0 sm:grid-cols-[1fr_auto]"><div><p className="font-semibold text-gray-800">{product}: {movement.delta > 0 ? "+" : ""}{movement.delta} units</p><p className="mt-1 text-xs text-gray-500">{movement.kind.split("_").join(" ")} · {movement.before} → {movement.after}{order ? ` · order ${order}` : ""}{movement.note ? ` · ${movement.note}` : ""}</p></div><time className="text-xs text-gray-400">{new Date(movement.createdAt).toLocaleString()}</time></article>; })}</div>}</section>}
  </div>;
}
