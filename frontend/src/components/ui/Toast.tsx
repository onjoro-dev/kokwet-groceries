import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

export interface ToastMessage { id: number; title: string; description?: string; tone?: "success" | "error" | "info" }

const ToastContext = createContext<{ show: (toast: Omit<ToastMessage, "id">) => void } | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const show = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4500);
  }, []);
  const value = useMemo(() => ({ show }), [show]);
  return <ToastContext.Provider value={value}>{children}<div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite" aria-atomic="true">{toasts.map((toast) => <div key={toast.id} role="status" className="pointer-events-auto rounded-xl border border-gray-200 bg-white p-4 shadow-lift"><p className="text-sm font-bold text-gray-900">{toast.title}</p>{toast.description && <p className="mt-1 text-sm text-gray-500">{toast.description}</p>}</div>)}</div></ToastContext.Provider>;
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
