import { Category } from "../../types";
import { resolveMediaUrl } from "../../utils/media";

export function CategoryFallback({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Category" className={className} fill="none">
      <rect width="64" height="64" rx="16" fill="#EAF5ED" />
      <path d="M15 22.5 32 12l17 10.5v22L32 55 15 44.5v-22Z" stroke="#006B32" strokeWidth="4" strokeLinejoin="round" />
      <path d="M15 22.5 32 33l17-10.5M32 33v22" stroke="#006B32" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

export default function CategoryArtwork({ category, className = "" }: { category: Category; className?: string }) {
  return category.image
    ? <img src={resolveMediaUrl(category.image)} alt={category.name} className={className} />
    : <CategoryFallback className={className} />;
}
