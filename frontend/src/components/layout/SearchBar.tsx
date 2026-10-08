import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RecentSearches from "./RecentSearches";

export default function SearchBar({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [focused, setFocused] = useState(false);
  useEffect(() => setQuery(params.get("q") || ""), [params]);
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`);
  };
  return <div className={`relative flex-1 ${className}`}><form onSubmit={handleSubmit} role="search"><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 150)} placeholder="Search milk, bread, sukuma wiki..." className="w-full rounded-xl border border-gray-200 bg-[#f7f8f5] py-3 pl-11 pr-14 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50" aria-label="Search products" aria-controls="search-suggestions" aria-expanded={focused && !query.trim()} /><button type="submit" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-700" aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg></button><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg></span></form><div id="search-suggestions"><RecentSearches open={focused && !query.trim()} onClose={() => setFocused(false)} /></div></div>;
}
