import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  if (!offline) return null;
  return <div role="status" className="bg-red-900 px-4 py-2 text-center text-sm font-semibold text-white">You’re offline. Your cart is safe; reconnect to continue checking out.</div>;
}
