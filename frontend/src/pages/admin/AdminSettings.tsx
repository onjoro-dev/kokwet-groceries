import { FormEvent, useEffect, useRef, useState } from "react";
import { getSettings, StoreSettings, updateSettings } from "../../services/adminService";
import { uploadProductImage } from "../../services/productService";
import { VISUAL_SLOTS } from "../../components/ui/BrandVisual";
import { resolveMediaUrl } from "../../utils/media";
import Button from "../../components/ui/Button";

const DEFAULTS: StoreSettings = {
  name: "KOKWET Groceries", phone: "0700 000 000", email: "", address: "Kitale Town, Kenya", logoUrl: "/uploads/logo.jpeg",
  primaryColor: "#006B32", accentColor: "#F7941D", highlightColor: "#FFC20E", visualImages: {}, lowStockThreshold: 5,
  heroTitle: "Fresh groceries, delivered to your door in Kitale", heroSubtitle: "From sukuma wiki to household essentials — order online and get it delivered same day.", heroImageUrl: "", heroCtaLabel: "Shop fresh produce", heroCtaLink: "/category/fresh-produce",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [assetFiles, setAssetFiles] = useState<Record<string, File>>({});
  const [assetPreviews, setAssetPreviews] = useState<Record<string, string>>({});
  const previewsRef = useRef(assetPreviews);
  previewsRef.current = assetPreviews;
  useEffect(() => { getSettings().then((value) => setSettings({ ...DEFAULTS, ...value })).catch((e) => setError(e.message)); }, []);
  useEffect(() => () => Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url)), []);

  const set = (key: keyof StoreSettings, value: string | number) => setSettings((current) => ({ ...current, [key]: value }));
  const chooseAsset = (key: string, file?: File) => {
    const oldPreview = assetPreviews[key];
    if (oldPreview) URL.revokeObjectURL(oldPreview);
    if (!file) {
      setAssetFiles((current) => { const next = { ...current }; delete next[key]; return next; });
      setAssetPreviews((current) => { const next = { ...current }; delete next[key]; return next; });
      return;
    }
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError("Choose an image no larger than 5 MB."); return; }
    setError("");
    setAssetFiles((current) => ({ ...current, [key]: file }));
    setAssetPreviews((current) => ({ ...current, [key]: URL.createObjectURL(file) }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      const uploaded = await Promise.all(Object.entries(assetFiles).map(async ([key, file]) => [key, await uploadProductImage(file)] as const));
      let logoUrl = settings.logoUrl;
      let heroImageUrl = settings.heroImageUrl;
      const visualImages = { ...(settings.visualImages || {}) };
      for (const [key, url] of uploaded) {
        if (key === "logo") logoUrl = url;
        else if (key === "hero") heroImageUrl = url;
        else visualImages[key.replace("visual:", "")] = url;
      }
      const saved = await updateSettings({ ...settings, logoUrl, heroImageUrl, visualImages });
      Object.values(assetPreviews).forEach((url) => URL.revokeObjectURL(url));
      setSettings({ ...DEFAULTS, ...saved }); setAssetFiles({}); setAssetPreviews({});
      localStorage.setItem("kokwet_brand", JSON.stringify(saved));
      window.dispatchEvent(new Event("store-settings-changed"));
      applyBrand(saved);
      setMessage("Store settings and uploaded photos have been saved.");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const field = (label: string, key: keyof StoreSettings, type = "text") => <label className="text-sm text-gray-600">{label}<input type={type} value={settings[key] as string | number} onChange={(e) => set(key, type === "number" ? Number(e.target.value) : e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5" /></label>;
  const imagePreview = (key: string, savedUrl?: string) => assetPreviews[key] || resolveMediaUrl(savedUrl);

  return <div><h1 className="text-xl font-bold text-gray-800">Store settings</h1><p className="mb-5 mt-1 text-sm text-gray-500">Update the logo, brand colors, homepage banner and interface photos.</p><form onSubmit={submit} className="grid gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-card sm:grid-cols-2">
    {field("Store name", "name")}{field("Contact phone", "phone", "tel")}{field("Contact email", "email", "email")}{field("Store address", "address")}{field("Low stock alert when units reach", "lowStockThreshold", "number")}
    <label className="text-sm text-gray-600">Brand green<input type="color" value={settings.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="mt-1 block h-11 w-full rounded border" /></label>
    <label className="text-sm text-gray-600">Brand orange<input type="color" value={settings.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="mt-1 block h-11 w-full rounded border" /></label>
    <label className="text-sm text-gray-600">Brand yellow<input type="color" value={settings.highlightColor} onChange={(e) => set("highlightColor", e.target.value)} className="mt-1 block h-11 w-full rounded border" /></label>
    <label className="text-sm text-gray-600">Store logo photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => chooseAsset("logo", e.target.files?.[0])} className="mt-1 block w-full text-sm" /></label>
    {(imagePreview("logo", settings.logoUrl)) && <div><p className="mb-1 text-xs text-gray-500">Logo preview</p><img src={imagePreview("logo", settings.logoUrl)} alt="Store logo preview" className="h-20 max-w-48 object-contain" /></div>}
    <div className="sm:col-span-2 mt-2 border-t pt-4"><h2 className="font-semibold text-gray-800">Homepage hero</h2><p className="mt-1 text-xs text-gray-500">This welcome banner is shown at the top of the customer home page.</p></div>
    {field("Welcome heading", "heroTitle")}{field("Button label", "heroCtaLabel")}
    <label className="text-sm text-gray-600 sm:col-span-2">Welcome text<textarea rows={3} value={settings.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5" /></label>
    <label className="text-sm text-gray-600">Button destination (store path)<input required pattern="/(?!/).*" value={settings.heroCtaLink} onChange={(e) => set("heroCtaLink", e.target.value)} placeholder="/category/fresh-produce" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5" /></label>
    <label className="text-sm text-gray-600">Hero photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => chooseAsset("hero", e.target.files?.[0])} className="mt-1 block w-full text-sm" /><span className="mt-1 block text-xs text-gray-400">Maximum 5 MB.</span></label>
    {imagePreview("hero", settings.heroImageUrl) && <div className="sm:col-span-2"><p className="mb-1 text-xs text-gray-500">Hero photo preview</p><img src={imagePreview("hero", settings.heroImageUrl)} alt="Homepage hero preview" className="h-40 w-full rounded-lg object-cover" /></div>}
    <details className="sm:col-span-2 rounded-lg border border-gray-200 p-4"><summary className="cursor-pointer font-semibold text-gray-700">Upload photos for interface icons ({VISUAL_SLOTS.length} places)</summary><p className="mb-4 mt-2 text-xs text-gray-500">Choose a photo for each emoji-style illustration. Leave a slot empty to keep its built-in symbol.</p><div className="grid gap-4 md:grid-cols-2">{VISUAL_SLOTS.map(([slot, label]) => <label key={slot} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm text-gray-600"><span className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-50">{imagePreview(`visual:${slot}`, settings.visualImages?.[slot]) && <img src={imagePreview(`visual:${slot}`, settings.visualImages?.[slot])} alt="" className="h-full w-full object-cover" />}</span><span className="flex-1">{label}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => chooseAsset(`visual:${slot}`, e.target.files?.[0])} className="mt-1 block w-full text-xs" /></span></label>)}</div></details>
    {message && <p className="sm:col-span-2 text-sm text-green-700">{message}</p>}{error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}<div><Button disabled={busy}>{busy ? "Uploading and saving..." : "Save settings"}</Button></div>
  </form></div>;
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
