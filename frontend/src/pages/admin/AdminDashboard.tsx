import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrderStats } from "../../services/orderService";
import { formatKES } from "../../utils";
import StatCard from "../../components/admin/StatCard";
import Spinner from "../../components/ui/Spinner";
import BrandVisual from "../../components/ui/BrandVisual";

/** Admin home page: a handful of big, easy-to-read numbers and quick links to the main tasks. */
export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
  } | null>(null);

  useEffect(() => {
    getOrderStats().then(setStats);
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-6">Here's how your store is doing today.</p>

      {!stats ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<BrandVisual slot="dashboardTotalOrders" fallback="🧾" className="h-9 w-9" imageClassName="h-full w-full rounded-full object-cover" />} label="Total orders" value={String(stats.totalOrders)} tone="neutral" />
          <StatCard icon={<BrandVisual slot="dashboardPending" fallback="⏳" className="h-9 w-9" imageClassName="h-full w-full rounded-full object-cover" />} label="Orders in progress" value={String(stats.pendingOrders)} tone="orange" />
          <StatCard icon={<BrandVisual slot="dashboardDelivered" fallback="✅" className="h-9 w-9" imageClassName="h-full w-full rounded-full object-cover" />} label="Delivered orders" value={String(stats.deliveredOrders)} tone="green" />
          <StatCard icon={<BrandVisual slot="dashboardRevenue" fallback="💰" className="h-9 w-9" imageClassName="h-full w-full rounded-full object-cover" />} label="Total revenue" value={formatKES(stats.totalRevenue)} tone="green" />
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          to="/admin/products"
          className="bg-white border border-gray-100 rounded-xl shadow-card p-5 hover:border-brand-300 transition-colors"
        >
          <BrandVisual slot="dashboardProductsLink" fallback="🛒" className="mb-2 h-12 w-12 text-3xl" imageClassName="h-full w-full rounded object-cover" />
          <p className="font-bold text-gray-800">Manage products</p>
          <p className="text-sm text-gray-500 mt-1">Add new items, update prices, and track stock.</p>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-white border border-gray-100 rounded-xl shadow-card p-5 hover:border-brand-300 transition-colors"
        >
          <BrandVisual slot="dashboardOrdersLink" fallback="🧾" className="mb-2 h-12 w-12 text-3xl" imageClassName="h-full w-full rounded object-cover" />
          <p className="font-bold text-gray-800">View orders</p>
          <p className="text-sm text-gray-500 mt-1">See new orders and update their delivery status.</p>
        </Link>
        <Link
          to="/admin/categories"
          className="bg-white border border-gray-100 rounded-xl shadow-card p-5 hover:border-brand-300 transition-colors"
        >
          <BrandVisual slot="dashboardCategoriesLink" fallback="📂" className="mb-2 h-12 w-12 text-3xl" imageClassName="h-full w-full rounded object-cover" />
          <p className="font-bold text-gray-800">Manage categories</p>
          <p className="text-sm text-gray-500 mt-1">Organise how products are grouped in your store.</p>
        </Link>
      </div>
    </div>
  );
}
