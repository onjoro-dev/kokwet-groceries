import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Category, Product, ProductPromotions } from "../types";
import { getProducts, getProductPromotions } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { getSettings, StoreSettings } from "../services/adminService";
import ProductGrid from "../components/product/ProductGrid";
import Spinner from "../components/ui/Spinner";
import CategoryArtwork from "../components/category/CategoryArtwork";
import { resolveMediaUrl } from "../utils/media";

const defaultSettings: StoreSettings = {
  name: "KOKWET Groceries", phone: "", email: "", address: "", logoUrl: "/uploads/logo.jpeg", primaryColor: "#006B32", accentColor: "#F7941D", highlightColor: "#FFC20E", visualImages: {}, lowStockThreshold: 5,
  heroTitle: "Fresh groceries, delivered to your door in Kitale", heroSubtitle: "From sukuma wiki to household essentials — order online and get it delivered same day.", heroImageUrl: "", heroCtaLabel: "Shop fresh produce", heroCtaLink: "/category/fresh-produce",
};

const defaultBannerSlides = [
  { image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=85", title: "Fresh groceries, delivered to your door", eyebrow: "Fresh from the market", description: "Shop fresh produce and everyday essentials from KOKWET Groceries.", link: "/categories", buttonLabel: "Shop groceries" },
  { image: "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=1800&q=85", title: "Good food starts with fresh choices", eyebrow: "Picked for your home", description: "Find the ingredients you need for the week, all in one place.", link: "/category/fresh-produce", buttonLabel: "Browse fresh produce" },
  { image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1800&q=85", title: "Make your weekly shop easier", eyebrow: "Shop KOKWET", description: "Browse the store and get your essentials delivered around Kitale.", link: "/categories", buttonLabel: "Explore the store" },
];

function ProductShelf({ title, subtitle, products }: { title: string; subtitle: string; products: Product[] }) {
  if (!products.length) return null;
  return <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
    <div className="mb-4"><h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">{title}</h2><p className="mt-0.5 text-sm text-gray-500">{subtitle}</p></div>
    <ProductGrid products={products} />
  </section>;
}

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<ProductPromotions>({ newArrivals: [], trending: [], megaSales: [] });
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    Promise.allSettled([getProducts({ featured: true, limit: 10 }), getCategories(), getProductPromotions(), getSettings()])
      .then(([productsRes, catsRes, promotionsRes, settingsRes]) => {
        if (productsRes.status === "fulfilled") setFeatured(productsRes.value.products);
        if (catsRes.status === "fulfilled") setCategories(catsRes.value);
        if (promotionsRes.status === "fulfilled") setPromotions(promotionsRes.value);
        if (settingsRes.status === "fulfilled") setSettings({ ...defaultSettings, ...settingsRes.value });
      })
      .finally(() => setLoading(false));
  }, []);

  const heroLink = settings.heroCtaLink?.startsWith("/") ? settings.heroCtaLink : "/categories";
  const bannerProducts = [...promotions.megaSales, ...promotions.newArrivals, ...promotions.trending].slice(0, 3);
  const fallbackSlides = defaultBannerSlides.map((slide, index) => index === 0 ? {
    ...slide,
    image: resolveMediaUrl(settings.heroImageUrl) || slide.image,
    title: settings.heroTitle || slide.title,
    description: settings.heroSubtitle || slide.description,
    link: heroLink,
    buttonLabel: settings.heroCtaLabel || slide.buttonLabel,
  } : slide);
  const promotionSlides = bannerProducts.map((product, index) => ({
    image: resolveMediaUrl(product.image || product.images[0]) || defaultBannerSlides[index % defaultBannerSlides.length].image,
    title: product.name,
    eyebrow: "Fresh pick of the week",
    link: `/product/${product.slug}`,
    description: "Browse this fresh pick and discover fair prices from KOKWET Groceries.",
    buttonLabel: "View this pick",
  }));
  const bannerSlides = promotionSlides.length ? [...promotionSlides, ...fallbackSlides.slice(0, 3 - promotionSlides.length)] : fallbackSlides;
  const heroSlide = bannerSlides[bannerIndex % bannerSlides.length];

  useEffect(() => {
    if (bannerSlides.length < 2 || paused) return;
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % bannerSlides.length), 6000);
    return () => window.clearInterval(timer);
  }, [bannerSlides.length, paused]);

  return <div className="pb-4">
    <section className="bg-[#f4f6ef] px-3 py-4 sm:px-6 sm:py-6">
      <div className="relative mx-auto min-h-[310px] max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-[#143d25] text-white shadow-lg transition duration-700 sm:min-h-[370px] animate-[fadeIn_700ms_ease-out_both]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false); }}>
        {heroSlide.image && <img key={heroSlide.image} src={heroSlide.image} alt={`${heroSlide.title} promotional banner`} className="absolute inset-0 h-full w-full animate-fade-in object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
        <div className="relative flex min-h-[310px] max-w-2xl flex-col justify-center px-6 py-10 sm:min-h-[370px] sm:px-12 sm:py-14">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm"><span className="h-2 w-2 rounded-full bg-accent-500" />{heroSlide.eyebrow}</span>
          <h1 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{bannerSlides.length ? heroSlide.title : settings.heroTitle}</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base">{heroSlide.description}</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link to={heroSlide.link} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-accent-600">{heroSlide.buttonLabel}<span aria-hidden="true">→</span></Link>
            <span className="text-xs font-medium text-white/80">Carefully picked. Delivered with care.</span>
          </div>
        </div>
        {bannerSlides.length > 1 && <>
          <button onClick={() => setBannerIndex((current) => (current - 1 + bannerSlides.length) % bannerSlides.length)} className="absolute bottom-5 right-16 rounded-full border border-white/20 bg-black/25 p-2.5 text-white backdrop-blur transition hover:bg-black/50 sm:bottom-6 sm:right-20" aria-label="Previous banner"><ChevronLeft size={19} /></button>
          <button onClick={() => setBannerIndex((current) => (current + 1) % bannerSlides.length)} className="absolute bottom-5 right-5 rounded-full border border-white/20 bg-black/25 p-2.5 text-white backdrop-blur transition hover:bg-black/50 sm:bottom-6 sm:right-6" aria-label="Next banner"><ChevronRight size={19} /></button>
          <button onClick={() => setPaused((value) => !value)} className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-black/25 p-2.5 text-white backdrop-blur transition hover:bg-black/50 sm:left-6" aria-label={paused ? "Resume banner rotation" : "Pause banner rotation"}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>
          <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 gap-1.5 sm:flex" aria-label="Choose banner slide">{bannerSlides.map((slide, index) => <button key={slide.title} onClick={() => setBannerIndex(index)} className={`h-1.5 rounded-full transition-all ${index === bannerIndex ? "w-8 bg-white" : "w-2 bg-white/55 hover:bg-white"}`} aria-label={`Show banner ${index + 1}`} />)}</div>
        </>}
      </div>
    </section>

    {promotions.megaSales.length > 0 && (
      <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#c93622] via-[#e94d2e] to-[#f17a27] px-5 py-5 text-white shadow-lg sm:flex sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="absolute -right-8 -top-14 h-40 w-40 rounded-full border-[28px] border-white/10" />
          <div className="relative max-w-2xl">
            <span className="mb-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]">Limited-time savings</span>
            <h2 className="text-xl font-black sm:text-2xl">Fresh deals, prices that beat the weekly shop.</h2>
            <p className="mt-1 text-sm text-white/90">Explore {promotions.megaSales.length} current offers across household essentials and pantry favourites.</p>
          </div>
          <div className="relative mt-4 flex items-center gap-3 sm:mt-0">
            <div className="rounded-xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm"><span className="block text-[10px] font-bold uppercase tracking-wider">Save</span><span className="text-lg font-black">Big</span></div>
            <Link to="/search?offer=true" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-orange-800 shadow-sm transition hover:-translate-y-0.5">Shop deals →</Link>
          </div>
        </div>
      </section>
    )}

    <section className="mx-auto max-w-7xl px-4 pb-3 pt-7 sm:px-6 sm:pt-9">
      <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Explore the store</p><h2 className="mt-1 text-xl font-extrabold text-gray-900">Shop by category</h2></div><Link to="/categories" className="text-sm font-semibold text-brand-700 hover:underline">All categories →</Link></div>
      <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar sm:grid sm:grid-cols-4 sm:gap-4 md:grid-cols-8">
        {categories.map((cat) => <Link key={cat._id} to={`/category/${cat.slug}`} className="group flex min-w-[100px] flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-md sm:min-w-0 sm:p-4"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 transition group-hover:bg-brand-100"><CategoryArtwork category={cat} className="h-10 w-10 object-cover text-3xl" /></span><span className="text-xs font-semibold leading-tight text-gray-700 group-hover:text-brand-700">{cat.name}</span></Link>)}
      </div>
    </section>
    <ProductShelf title="Mega sales" subtitle="Discounts based on current product prices" products={promotions.megaSales} />
    <ProductShelf title="Trending with customers" subtitle="Best sellers based on completed M-Pesa orders" products={promotions.trending} />
    <ProductShelf title="New arrivals" subtitle="Recently added products" products={promotions.newArrivals} />
    <section className="mx-auto max-w-7xl px-4 py-4 pb-12 sm:px-6">
      <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-brand-700">Picked for you</p><h2 className="mt-1 text-xl font-extrabold text-gray-900">Today's picks</h2></div><Link to="/search" className="text-sm font-semibold text-brand-700 hover:underline">See all →</Link></div>
      {loading ? <div className="flex justify-center py-12"><Spinner size={32} /></div> : featured.length ? <ProductGrid products={featured} /> : <p className="rounded-xl bg-gray-50 py-10 text-center text-sm text-gray-500">Fresh picks will be here soon.</p>}
    </section>
  </div>;
}
