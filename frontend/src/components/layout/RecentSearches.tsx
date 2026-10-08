import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { Product } from "../../types";
import { resolveMediaUrl } from "../../utils/media";

const STORAGE_KEY = "kokwet_recent_searches";
export default function RecentSearches({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [recent, setRecent] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } });
  const [trending, setTrending] = useState<Product[]>([]);
  useEffect(() => { if (!open) return; getProducts({ sort: "popular", limit: 5 }).then((result) => setTrending(result.products.slice(0, 5))).catch(() => setTrending([])); }, [open]);
  if (!open) return null;
  const search = (event: FormEvent) => { event.preventDefault(); };
  const run = (query: string) => { const next = [query, ...recent.filter((item) => item !== query)].slice(0, 5); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setRecent(next); navigate(`/search?q=${encodeURIComponent(query)}`); onClose(); };
  return <div className="absolute left-0 right-0 top-full z-30 mx-3 mt-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-lift sm:mx-0"><form onSubmit={search} className="sr-only"><input aria-label="Search suggestions" /></form><p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Recent searches</p><div className="space-y-1">{recent.length ? recent.map((item) => <button key={item} type="button" onClick={() => run(item)} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-800">{item}</button>) : <p className="px-3 py-2 text-sm text-gray-500">Your recent searches will appear here.</p>}</div><p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-gray-400">Trending now</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-5">{trending.map((product) => <Link key={product._id} to={`/product/${product.slug}`} onClick={onClose} className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-50"><img src={resolveMediaUrl(product.image)} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="min-w-0 text-left text-xs font-semibold text-gray-700">{product.name}</span></Link>)}</div></div>;
}
