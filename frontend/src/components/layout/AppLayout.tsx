import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSettings, StoreSettings } from "../../services/adminService";
import Header from "./Header";
import DeliveryBar from "./DeliveryBar";
import CategoryNav from "./CategoryNav";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import CartDrawer from "../cart/CartDrawer";
import HelpChat from "./HelpChat";
import OfflineBanner from "./OfflineBanner";

/** Shared shell for every customer-facing page: header, delivery bar, category nav, footer, cart drawer. */
export default function AppLayout() {
  const [, setBrandRefresh] = useState(0);
  useEffect(() => {
    getSettings().then((value) => {
      localStorage.setItem("kokwet_brand", JSON.stringify(value));
      applyBrand(value);
      window.dispatchEvent(new Event("store-settings-changed"));
      setBrandRefresh((revision) => revision + 1);
    }).catch(() => {
      try { const stored = localStorage.getItem("kokwet_brand"); if (stored) applyBrand(JSON.parse(stored) as StoreSettings); } catch { /* defaults remain active */ }
    });
    const refresh = () => setBrandRefresh((revision) => revision + 1);
    window.addEventListener("store-settings-changed", refresh);
    return () => window.removeEventListener("store-settings-changed", refresh);
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <OfflineBanner />
      <DeliveryBar />
      <Header />
      <CategoryNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <HelpChat />
    </div>
  );
}

function applyBrand(settings: StoreSettings) {
  document.documentElement.style.setProperty("--store-primary", settings.primaryColor);
  document.documentElement.style.setProperty("--store-primary-dark", darken(settings.primaryColor));
  document.documentElement.style.setProperty("--store-accent", settings.accentColor);
  document.documentElement.style.setProperty("--store-highlight", settings.highlightColor);
}

function darken(hex: string) {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return hex;
  return `#${[0, 2, 4].map((index) => Math.round(parseInt(value.slice(index, index + 2), 16) * 0.78).toString(16).padStart(2, "0")).join("")}`;
}
