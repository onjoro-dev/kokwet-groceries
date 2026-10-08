import { ReactNode, useEffect, useRef } from "react";

interface DrawerProps { open: boolean; title: string; onClose: () => void; children: ReactNode; width?: string }

export default function Drawer({ open, title, onClose, children, width = "max-w-md" }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previous?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[80]" role="presentation"><button className="absolute inset-0 bg-gray-950/45" onClick={onClose} aria-label="Close panel" /><div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`absolute inset-y-0 right-0 flex w-full ${width} flex-col bg-white shadow-lift`}><div className="flex items-center justify-between border-b px-5 py-4"><h2 className="text-lg font-bold text-gray-900">{title}</h2><button type="button" onClick={onClose} aria-label="Close panel" className="rounded-lg p-2 text-xl text-gray-500 hover:bg-gray-100">×</button></div><div className="flex-1 overflow-y-auto">{children}</div></div></div>;
}
