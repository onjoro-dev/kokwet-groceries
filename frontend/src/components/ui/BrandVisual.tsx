import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { resolveMediaUrl } from "../../utils/media";

export const VISUAL_SLOTS = [
  ["helpLauncher", "Customer help button"],
  ["navHome", "Mobile home navigation"], ["navCategories", "Mobile categories navigation"], ["navOrders", "Mobile orders navigation"], ["navAccount", "Mobile account navigation"], ["navCart", "Mobile cart button"],
  ["adminDashboard", "Admin dashboard navigation"], ["adminProducts", "Admin products navigation"], ["adminCategories", "Admin categories navigation"], ["adminOrders", "Admin orders navigation"], ["adminStaff", "Admin staff navigation"], ["adminStatistics", "Admin statistics navigation"], ["adminActivity", "Admin activity navigation"], ["adminSettings", "Admin settings navigation"],
  ["emptyCart", "Empty cart"], ["emptySearch", "No search results"], ["emptyOrders", "No orders"], ["emptyProducts", "No products"],
  ["dashboardTotalOrders", "Dashboard total orders card"], ["dashboardPending", "Dashboard pending orders card"], ["dashboardDelivered", "Dashboard delivered orders card"], ["dashboardRevenue", "Dashboard revenue card"],
  ["dashboardProductsLink", "Dashboard manage products card"], ["dashboardOrdersLink", "Dashboard view orders card"], ["dashboardCategoriesLink", "Dashboard manage categories card"],
  ["checkoutPayment", "Checkout payment method"], ["notFound", "Page not found"], ["orderSuccess", "Order confirmation"], ["productDelivery", "Product delivery information"], ["productPayment", "Product payment information"], ["productReturn", "Product freshness and returns information"], ["confirmWarning", "Confirmation dialog"],
] as const;

export type VisualSlot = (typeof VISUAL_SLOTS)[number][0];

interface BrandVisualProps {
  slot: VisualSlot;
  fallback?: ReactNode;
  className?: string;
  imageClassName?: string;
  style?: CSSProperties;
  alt?: string;
}

export default function BrandVisual({ slot, fallback, className = "", imageClassName = "h-full w-full object-contain", style, alt = "" }: BrandVisualProps) {
  const [image, setImage] = useState("");
  useEffect(() => {
    const read = () => {
      try { setImage(JSON.parse(localStorage.getItem("kokwet_brand") || "{}").visualImages?.[slot] || ""); }
      catch { setImage(""); }
    };
    read();
    window.addEventListener("store-settings-changed", read);
    return () => window.removeEventListener("store-settings-changed", read);
  }, [slot]);
  return <span className={`inline-flex items-center justify-center ${className}`} style={style}>
    {image ? <img src={resolveMediaUrl(image)} alt={alt} className={imageClassName} /> : fallback}
  </span>;
}
