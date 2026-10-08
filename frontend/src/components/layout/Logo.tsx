import { Link } from "react-router-dom";
import { resolveMediaUrl } from "../../utils/media";

export default function Logo({ compact = false }: { compact?: boolean }) {
  let settings: { name?: string; logoUrl?: string } = { logoUrl: "/uploads/logo.jpeg" };
  try { settings = { ...settings, ...JSON.parse(localStorage.getItem("kokwet_brand") || "{}") }; } catch { /* use defaults */ }
  const words = (settings.name || "KOKWET Groceries").split(" ");
  return (
    <Link to="/" aria-label={`${settings.name || "Kokwet Groceries"} home`} className="flex shrink-0 items-center gap-2.5">
      {settings.logoUrl ? (
        <span className="brand-logo-surface flex h-12 w-[132px] items-center justify-center overflow-hidden rounded-xl px-1 sm:h-[54px] sm:w-[150px]" aria-hidden="true">
          <img src={resolveMediaUrl(settings.logoUrl)} alt="" className="h-full w-full object-contain mix-blend-screen" />
        </span>
      ) : (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-xl font-black text-white" aria-hidden="true">K</span>
      )}
      {!compact && !settings.logoUrl && <span className="text-lg font-extrabold leading-none tracking-tight"><span className="text-brand-700">{words[0]}</span>{" "}<span className="text-accent-500">{words.slice(1).join(" ")}</span></span>}
    </Link>
  );
}
