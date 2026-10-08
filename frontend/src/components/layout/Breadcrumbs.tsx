import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem { label: string; to?: string }
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-gray-500"><Link to="/" className="font-medium hover:text-brand-700">Home</Link>{items.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-2"><span aria-hidden="true">/</span>{item.to ? <Link to={item.to} className="hover:text-brand-700">{item.label}</Link> : <span aria-current="page" className="text-gray-700">{item.label}</span>}</span>)}</nav>;
}

export function HighlightedText({ text, query }: { text: string; query: string }) {
  const safeQuery = query.trim();
  if (!safeQuery) return <>{text}</>;
  const escaped = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(${escaped})`, "ig");
  const parts = String(text).split(match);
  return <>{parts.map((part, index) => part.toLowerCase() === safeQuery.toLowerCase() ? <strong key={`${part}-${index}`} className="font-extrabold text-gray-900">{part}</strong> : <span key={`${part}-${index}`}>{part}</span>)}</>;
}
