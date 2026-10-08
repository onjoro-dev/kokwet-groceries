import { NavLink, Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package, Tags, ShoppingBag, FileClock, Users, ChartNoAxesCombined, Settings, UserRound, Menu, X, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BrandVisual, { VisualSlot } from "../ui/BrandVisual";
import Logo from "../layout/Logo";
import { getSettings } from "../../services/adminService";

type AdminNavItem = { to: string; label: string; icon: VisualSlot; iconComponent?: React.ReactNode; fallback: string; end?: boolean; admin?: boolean };

const NAV_ITEMS: AdminNavItem[] = [
  { to: "/admin", label: "Dashboard", icon: "adminDashboard", iconComponent: <LayoutDashboard size={18} />, fallback: "", end: true },
  { to: "/admin/products", label: "Products", icon: "adminProducts", iconComponent: <Package size={18} />, fallback: "" },
  { to: "/admin/categories", label: "Categories", icon: "adminCategories", iconComponent: <Tags size={18} />, fallback: "" },
  { to: "/admin/orders", label: "Orders", icon: "adminOrders", iconComponent: <ShoppingBag size={18} />, fallback: "" },
];

const EXTRA_NAV_ITEMS: AdminNavItem[] = [
  { to: "/admin/activity", label: "Activity", icon: "adminActivity", iconComponent: <FileClock size={18} />, fallback: "", admin: true },
  { to: "/admin/staff", label: "Staff", icon: "adminStaff", iconComponent: <Users size={18} />, fallback: "", admin: true },
  { to: "/admin/statistics", label: "Statistics", icon: "adminStatistics", iconComponent: <ChartNoAxesCombined size={18} />, fallback: "", admin: true },
  { to: "/admin/financial-records", label: "Financial records", icon: "adminStatistics", iconComponent: <ChartNoAxesCombined size={18} />, fallback: "", admin: true },
  { to: "/admin/settings", label: "Settings", icon: "adminSettings", iconComponent: <Settings size={18} />, fallback: "", admin: true },
  { to: "/admin/profile", label: "My profile", icon: "adminSettings", iconComponent: <UserRound size={18} />, fallback: "", admin: true },
];

/**
 * Shell for the whole admin dashboard: a simple sidebar with big, clearly-labelled icons
 * (designed for shop staff who may not be very computer-conversant), plus a mobile-friendly
 * top bar with a menu toggle. Guards every admin page — only logged-in admins get past this.
 */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setBrandRevision] = useState(0);
  useEffect(() => { getSettings().then((settings) => {
    localStorage.setItem("kokwet_brand", JSON.stringify(settings));
    document.documentElement.style.setProperty("--store-primary", settings.primaryColor);
    document.documentElement.style.setProperty("--store-primary-dark", darken(settings.primaryColor));
    document.documentElement.style.setProperty("--store-accent", settings.accentColor);
    document.documentElement.style.setProperty("--store-highlight", settings.highlightColor);
    window.dispatchEvent(new Event("store-settings-changed"));
    setBrandRevision((revision) => revision + 1);
  }).catch(() => undefined); }, []);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  if (!["admin", "storekeeper", "delivery_officer"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  const isRoleAllowed = (role: typeof user.role, pathname: string) =>
    role === "admin" ||
    (role === "storekeeper" && /^(\/admin\/products|\/admin\/categories|\/admin\/profile)/.test(pathname)) ||
    (role === "delivery_officer" && pathname.startsWith("/admin/orders"));
  const canAccess = isRoleAllowed(user.role, location.pathname);
  if (!canAccess) return <Navigate to={user.role === "storekeeper" ? "/admin/products" : user.role === "delivery_officer" ? "/admin/orders" : "/admin"} replace />;
  const navigation = [...NAV_ITEMS, ...EXTRA_NAV_ITEMS].filter((item) => (!item.admin || user.role === "admin") && (user.role === "admin" || (user.role === "storekeeper" ? ["/admin/products", "/admin/categories", "/admin/profile"].includes(item.to) : item.to === "/admin/orders")));

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="sticky top-0 hidden h-screen md:flex md:flex-col w-64 shrink-0 bg-brand-800 text-white">
        <div className="flex items-center gap-2 border-b border-brand-700 px-5 py-6">
          <Logo compact />
          <div>
            <p className="font-extrabold leading-tight">KOKWET</p>
            <p className="text-xs text-brand-200 leading-tight">Admin Dashboard</p>
          </div>
        </div>
        <nav className="flex-1 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-brand-700 text-white border-r-4 border-accent-500" : "text-brand-100 hover:bg-brand-700/60"
                }`
              }
            >
              {item.iconComponent || <BrandVisual slot={item.icon} fallback={item.fallback} className="h-6 w-6" imageClassName="h-full w-full rounded object-cover" />}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-700 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-sm text-brand-200 hover:text-white px-2 py-1"><ArrowLeft size={15} /> Back to store</Link>
          <button onClick={logout} className="flex w-full items-center gap-2 text-left text-sm text-red-200 hover:text-red-100 px-2 py-1"><LogOut size={15} /> Log out</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-brand-800 text-white flex items-center justify-between px-4 py-3">
        <button onClick={() => setMenuOpen(true)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Open menu"><Menu size={22} /></button>
        <span className="font-bold">KOKWET Admin</span>
        <span className="w-6" />
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 bg-brand-800 text-white flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-700">
              <span className="font-bold">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close menu"><X size={22} /></button>
            </div>
            <nav className="flex-1 py-4">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-3.5 text-sm font-semibold ${
                      isActive ? "bg-brand-700 text-white" : "text-brand-100"
                    }`
                  }
                >
                  {item.iconComponent || <BrandVisual slot={item.icon} fallback={item.fallback} className="h-6 w-6" imageClassName="h-full w-full rounded object-cover" />}
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-brand-700 space-y-2">
              <Link to="/" className="flex items-center gap-2 text-sm text-brand-200 px-2 py-1"><ArrowLeft size={15} /> Back to store</Link>
              <button onClick={logout} className="flex w-full items-center gap-2 text-left text-sm text-red-200 px-2 py-1"><LogOut size={15} /> Log out</button>
            </div>
          </div>
          <button className="flex-1 bg-black/40" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
        </div>
      )}

      <main className="min-w-0 flex-1 pt-16 md:pt-0">
        <header className="hidden h-20 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm md:flex">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Operations</p><p className="mt-0.5 text-sm font-semibold text-gray-700">{location.pathname.split("/").pop() || "Dashboard"}</p></div>
          <div className="flex items-center gap-3"><span className="hidden rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 sm:inline">{user.role.replace("_", " ")}</span><span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-black text-brand-800">{user.name?.slice(0, 1).toUpperCase() || "U"}</span></div>
        </header>
        <div className="mx-auto max-w-6xl p-4 sm:p-6"><Outlet /></div>
      </main>
    </div>
  );
}

function darken(hex: string) {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return hex;
  return `#${[0, 2, 4].map((index) => Math.round(parseInt(value.slice(index, index + 2), 16) * 0.78).toString(16).padStart(2, "0")).join("")}`;
}
