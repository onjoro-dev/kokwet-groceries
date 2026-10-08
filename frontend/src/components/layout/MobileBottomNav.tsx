import { NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import BrandVisual, { VisualSlot } from "../ui/BrandVisual";

const items: { to: string; label: string; slot: VisualSlot; fallback: string }[] = [
  { to: "/", label: "Home", slot: "navHome", fallback: "🏠" },
  { to: "/categories", label: "Categories", slot: "navCategories", fallback: "📋" },
  { to: "/orders", label: "Orders", slot: "navOrders", fallback: "🧾" },
  { to: "/account", label: "Account", slot: "navAccount", fallback: "👤" },
];

export default function MobileBottomNav() {
  const { itemCount, openCart } = useCart();
  const nav = (item: (typeof items)[number]) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs ${isActive ? "text-brand-700 font-semibold" : "text-gray-500"}`}>
    <BrandVisual slot={item.slot} fallback={item.fallback} className="h-6 w-6 text-lg" imageClassName="h-full w-full rounded object-cover" />{item.label}
  </NavLink>;
  return <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 flex items-stretch">
    {items.slice(0, 2).map(nav)}
    <button onClick={openCart} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs text-gray-500 relative">
      <BrandVisual slot="navCart" fallback="🛒" className="h-6 w-6 text-lg" imageClassName="h-full w-full rounded object-cover" />Cart
      {itemCount > 0 && <span className="absolute top-1 right-6 bg-accent-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{itemCount}</span>}
    </button>
    {items.slice(2).map(nav)}
  </nav>;
}
