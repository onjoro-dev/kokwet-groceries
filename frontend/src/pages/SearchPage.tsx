import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProductListResponse } from "../types";
import { getProducts } from "../services/productService";
import ProductGrid from "../components/product/ProductGrid";
import SearchBar from "../components/layout/SearchBar";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";

const PAGE_SIZE = 24;
type Facets = NonNullable<ProductListResponse["facets"]>;

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [result, setResult] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");

  useEffect(() => {
    setMinPrice(params.get("minPrice") || "");
    setMaxPrice(params.get("maxPrice") || "");
    setLoading(true);
    setError("");
    getProducts({
      search: query || undefined,
      category: params.get("category") || undefined,
      minPrice: params.has("minPrice") ? Number(params.get("minPrice")) : undefined,
      maxPrice: params.has("maxPrice") ? Number(params.get("maxPrice")) : undefined,
      offer: params.get("offer") === "true" || undefined,
      new: params.get("new") === "true" || undefined,
      brand: params.get("brand") || undefined,
      dietary: params.get("dietary") || undefined,
      sort: params.get("sort") || undefined,
      page: Number(params.get("page") || 1),
      limit: PAGE_SIZE,
    })
      .then(setResult)
      .catch((err: Error) => setError(err.message || "Products could not be loaded. Please try again."))
      .finally(() => setLoading(false));
  }, [params, query]);

  const facets: Facets = result?.facets || { brands: [], dietaryLifestyle: [], categories: [] };
  const activeCount = ["category", "offer", "new", "brand", "dietary", "minPrice", "maxPrice"].filter((key) => params.has(key)).length;
  const page = Number(params.get("page") || 1);
  const clearFilters = () => setParams((current) => new URLSearchParams(current.get("q") ? `q=${encodeURIComponent(current.get("q") || "")}` : ""));
  const setFilter = (key: string, value?: string) => setParams((current) => {
    const next = new URLSearchParams(current);
    if (value !== undefined && value !== "") next.set(key, value);
    else next.delete(key);
    next.delete("page");
    return next;
  });
  const pageLabel = useMemo(() => {
    if (!result?.total) return "0 products";
    const first = (page - 1) * PAGE_SIZE + 1;
    return `${first}–${Math.min(page * PAGE_SIZE, result.total)} of ${result.total} products`;
  }, [page, result?.total]);

  const filterPanel = <FilterPanel
    facets={facets}
    params={params}
    minPrice={minPrice}
    maxPrice={maxPrice}
    setMinPrice={setMinPrice}
    setMaxPrice={setMaxPrice}
    setFilter={setFilter}
    applyPrice={() => setParams((current) => {
      const next = new URLSearchParams(current);
      if (minPrice) next.set("minPrice", minPrice); else next.delete("minPrice");
      if (maxPrice) next.set("maxPrice", maxPrice); else next.delete("maxPrice");
      next.delete("page");
      return next;
    })}
  />;

  return <main className="min-h-[60vh] bg-[#f7f8f5]">
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-4 sm:hidden"><SearchBar /></div>
      <nav className="mb-4 text-xs text-gray-500" aria-label="Breadcrumb"><Link to="/" className="hover:text-brand-700">Home</Link><span className="mx-2">/</span><span className="text-gray-800">{query ? "Search results" : "All products"}</span></nav>
      <div className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Kokwet Fresh Farm</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">{query ? <>Results for <span className="text-brand-700">“{query}”</span></> : "Shop all products"}</h1><p className="mt-1 text-sm text-gray-500">{loading ? "Finding the freshest picks…" : pageLabel}</p></div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setMobileFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm lg:hidden"><SlidersIcon />Filter{activeCount > 0 && <span className="rounded-full bg-brand-700 px-2 py-0.5 text-xs text-white">{activeCount}</span>}</button>
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm"><span className="hidden sm:inline">Sort by</span><select aria-label="Sort products" value={params.get("sort") || ""} onChange={(event) => setFilter("sort", event.target.value || undefined)} className="max-w-40 bg-transparent font-semibold text-gray-800 outline-none"><option value="">Recommended</option><option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="popular">Popular</option><option value="rating">Top rated</option><option value="name">Name: A–Z</option></select></label>
        </div>
      </div>

      {activeCount > 0 && <div className="mb-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-semibold text-gray-500">Applied filters</span>{activeFilterLabels(params, facets).map((item) => <button type="button" key={item.key} onClick={() => setFilter(item.key)} className="rounded-full border border-brand-100 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50">{item.label} <span aria-hidden="true">×</span></button>)}<button type="button" onClick={clearFilters} className="px-2 py-1 text-xs font-semibold text-gray-500 underline hover:text-gray-900">Clear all</button></div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden lg:block">{filterPanel}</aside>
        <section aria-label="Product results">
          {loading ? <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-100 bg-white"><Spinner size={32} /></div> : error ? <div className="rounded-2xl border border-red-100 bg-white p-8 text-center text-sm text-red-700">{error}</div> : <>
            <div className="mb-3 flex items-center justify-between"><p className="text-xs text-gray-500">Showing {pageLabel}</p><p className="hidden text-xs text-gray-500 sm:block">Fresh picks from Kokwet Fresh Farm</p></div>
            <ProductGrid products={result?.products || []} query={query} emptyMessage={query ? `We couldn't find anything for “${query}”. Try another search or remove some filters.` : "There are no products in this selection yet."} />
            {!result?.products.length && query && <div className="mt-5 rounded-xl border border-accent-100 bg-accent-50 p-4 text-sm text-gray-700"><strong className="text-accent-700">Did you mean “{query}”?</strong> Check the spelling or browse the matching categories below.<Button variant="outline" size="sm" className="mt-3" onClick={() => setParams((current) => { const next = new URLSearchParams(current); next.delete("q"); return next; })}>Browse all products</Button></div>}
            {result && result.pages > 1 && <div className="mt-7 flex items-center justify-center gap-2"><button disabled={page <= 1} onClick={() => setFilter("page", String(page - 1))} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="px-3 text-sm text-gray-600">Page {page} of {result.pages}</span><button disabled={page >= result.pages} onClick={() => setFilter("page", String(page + 1))} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Next</button></div>}
          </>}
        </section>
      </div>
    </div>

    {mobileFiltersOpen && <div className="fixed inset-0 z-[70] flex justify-end bg-black/40 lg:hidden" role="dialog" aria-modal="true" aria-label="Product filters" onClick={() => setMobileFiltersOpen(false)}><div className="flex h-full w-full max-w-sm flex-col bg-[#f7f8f5] shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b bg-white px-5 py-4"><div><h2 className="font-bold text-gray-900">Filter products</h2><p className="text-xs text-gray-500">{activeCount ? `${activeCount} filters selected` : "Find what you need"}</p></div><button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="rounded-lg p-2 text-xl text-gray-500 hover:bg-gray-100">×</button></div><div className="flex-1 overflow-y-auto p-4">{filterPanel}</div><div className="flex gap-3 border-t bg-white p-4"><button type="button" onClick={clearFilters} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold">Clear all</button><button type="button" onClick={() => setMobileFiltersOpen(false)} className="flex-1 rounded-xl bg-brand-700 py-3 text-sm font-bold text-white">Show {result?.total || 0} products</button></div></div></div>}
  </main>;
}

function FilterPanel({ facets, params, minPrice, maxPrice, setMinPrice, setMaxPrice, setFilter, applyPrice }: {
  facets: Facets; params: URLSearchParams; minPrice: string; maxPrice: string;
  setMinPrice: (value: string) => void; setMaxPrice: (value: string) => void;
  setFilter: (key: string, value?: string) => void; applyPrice: () => void;
}) {
  return <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b px-4 py-4"><h2 className="font-bold text-gray-900">Browse & filter</h2><span className="text-xs text-gray-400">{facets.categories.length} categories</span></div>
    <div className="p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Shop by</p><div className="space-y-1"><FilterChoice label="All offers" active={params.get("offer") === "true"} onClick={() => setFilter("offer", params.get("offer") === "true" ? undefined : "true")} /><FilterChoice label="New arrivals" active={params.get("new") === "true"} onClick={() => setFilter("new", params.get("new") === "true" ? undefined : "true")} /></div></div>
    <Facet title="Categories" count={facets.categories.length}>{facets.categories.map((category) => <FilterChoice key={category._id} label={category.name} active={params.get("category") === category._id} onClick={() => setFilter("category", params.get("category") === category._id ? undefined : category._id)} />)}</Facet>
    <Facet title="Brands" count={facets.brands.length}>{facets.brands.map((brand) => <FilterChoice key={brand} label={brand} active={params.get("brand") === brand} onClick={() => setFilter("brand", params.get("brand") === brand ? undefined : brand)} />)}</Facet>
    <Facet title="Dietary & lifestyle" count={facets.dietaryLifestyle.length}>{facets.dietaryLifestyle.map((tag) => <FilterChoice key={tag} label={tag} active={params.get("dietary") === tag} onClick={() => setFilter("dietary", params.get("dietary") === tag ? undefined : tag)} />)}</Facet>
    <div className="border-t p-4"><h3 className="mb-3 text-sm font-bold text-gray-800">Price range</h3><div className="flex items-center gap-2"><label className="min-w-0 flex-1"><span className="sr-only">Minimum price</span><input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min KSh" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-brand-500" /></label><span className="text-gray-400">—</span><label className="min-w-0 flex-1"><span className="sr-only">Maximum price</span><input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max KSh" className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-brand-500" /></label></div><button type="button" onClick={applyPrice} className="mt-3 w-full rounded-lg bg-brand-50 py-2 text-sm font-bold text-brand-800 hover:bg-brand-100">Apply price</button></div>
  </div>;
}

function Facet({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return <details className="group border-t" open><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-sm font-bold text-gray-800"><span>{title}<span className="ml-1.5 text-xs font-normal text-gray-400">({count})</span></span><span className="text-lg leading-none text-gray-400 transition group-open:rotate-45">+</span></summary><div className="max-h-52 space-y-0.5 overflow-y-auto px-4 pb-3">{children}</div></details>;
}

function FilterChoice({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-left text-sm text-gray-600 hover:text-brand-800"><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${active ? "border-brand-700 bg-brand-700 text-white" : "border-gray-300 bg-white"}`}>{active && <span className="text-[10px]">✓</span>}</span><span className="flex-1">{label}</span></button>;
}

function activeFilterLabels(params: URLSearchParams, facets: Facets) {
  const category = facets.categories.find((item) => item._id === params.get("category"));
  return [
    params.has("category") && { key: "category", label: category?.name || "Category" },
    params.has("offer") && { key: "offer", label: "Offers" },
    params.has("new") && { key: "new", label: "New arrivals" },
    params.has("brand") && { key: "brand", label: params.get("brand") || "Brand" },
    params.has("dietary") && { key: "dietary", label: params.get("dietary") || "Lifestyle" },
    params.has("minPrice") && { key: "minPrice", label: `From KSh ${params.get("minPrice")}` },
    params.has("maxPrice") && { key: "maxPrice", label: `Up to KSh ${params.get("maxPrice")}` },
  ].filter((item): item is { key: string; label: string } => Boolean(item));
}

function SlidersIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6" /></svg>; }
