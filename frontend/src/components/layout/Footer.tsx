import { Link } from "react-router-dom";
import { resolveMediaUrl } from "../../utils/media";

export default function Footer() {
  let settings: { name?: string; phone?: string; email?: string; address?: string; logoUrl?: string } = {};
  try { settings = JSON.parse(localStorage.getItem("kokwet_brand") || "{}"); } catch { /* use defaults */ }
  const phone = settings.phone && settings.phone.replace(/\D/g, "") !== "0700000000" ? settings.phone : "";
  const email = settings.email || "";
  const address = settings.address || "Kitale Town, Kenya";
  return (
    <footer className="mt-12 bg-brand-900 pb-20 text-brand-100 sm:pb-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 text-sm sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <div className="mb-3 flex items-center gap-2">{settings.logoUrl && <img src={resolveMediaUrl(settings.logoUrl)} alt={settings.name || "Store logo"} className="h-12 max-w-24 object-contain" />}{!settings.logoUrl && <span className="font-bold text-white">{settings.name || "KOKWET Groceries"}</span>}</div>
          <p className="text-brand-200">Fresh groceries delivered across Kitale Town and nearby areas.</p>
        </div>
        <div><h4 className="mb-3 font-semibold text-white">Shop</h4><ul className="space-y-2"><li><Link to="/" className="hover:text-white">Home</Link></li><li><Link to="/search?q=offers" className="hover:text-white">Today&apos;s offers</Link></li><li><Link to="/orders" className="hover:text-white">Track my order</Link></li><li><Link to="/categories" className="hover:text-white">All categories</Link></li></ul></div>
        <div><h4 className="mb-3 font-semibold text-white">Help</h4><ul className="space-y-2"><li><Link to="/help/delivery" className="hover:text-white">Delivery areas</Link></li><li><Link to="/help/payment" className="hover:text-white">M-Pesa payments</Link></li><li><Link to="/help/returns" className="hover:text-white">Returns policy</Link></li><li><Link to="/help" className="hover:text-white">Help and FAQs</Link></li></ul></div>
        <div><h4 className="mb-3 font-semibold text-white">Contact</h4><ul className="space-y-2 text-brand-200">{phone && <li><a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-white">{phone}</a></li>}{email && <li><a href={`mailto:${email}`} className="hover:text-white">{email}</a></li>}<li><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="hover:text-white">{address}</a></li><li>Open daily, 7am – 9pm</li></ul></div>
      </div>
      <div className="border-t border-brand-800 py-4 text-center text-xs text-brand-300">© {new Date().getFullYear()} {settings.name || "KOKWET Groceries"}. All rights reserved.</div>
    </footer>
  );
}
