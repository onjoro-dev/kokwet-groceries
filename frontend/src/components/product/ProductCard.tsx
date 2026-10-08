import { Link } from "react-router-dom";
import { Product } from "../../types";
import { formatKES, discountPercent } from "../../utils";
import { useCart } from "../../context/CartContext";
import Badge from "../ui/Badge";
import { useState } from "react";
import QuantityStepper from "../ui/QuantityStepper";
import { resolveMediaUrl } from "../../utils/media";
import QuickView from "./QuickView";
import { HighlightedText } from "../layout/Breadcrumbs";

export default function ProductCard({ product, query = "" }: { product: Product; query?: string }) {
  const { items, addItem, updateQuantity } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const cartItem = items.find((item) => item.product._id === product._id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock <= 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md">
      <div className="relative block" onClick={() => setQuickViewOpen(true)} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setQuickViewOpen(true)} aria-label={`Quick view ${product.name}`}>
        <div className="relative aspect-square overflow-hidden bg-[#f7f8f5] p-2 sm:p-3">
          <img
            src={resolveMediaUrl(product.image)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {discount && (
            <span className="absolute left-3 top-3 rounded-full bg-[#c93424] px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
              Save {discount}%
            </span>
          )}
          {product.createdAt && Date.now() - new Date(product.createdAt).getTime() < 30 * 86400000 && <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-800 shadow-sm">New</span>}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Badge color="red">Out of stock</Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link to={`/product/${product.slug}`} className="flex-1">
          {product.brand && <p className="mb-1 truncate text-[10px] font-bold uppercase tracking-wider text-gray-400">{product.brand}</p>}
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-gray-800 group-hover:text-brand-800"><HighlightedText text={product.name} query={query} /></h3>
          <p className="mt-1 text-xs text-gray-500">{product.unit}</p>
        </Link>

        {product.ratingCount > 0 && <div className="mt-2 flex items-center gap-1 text-xs" aria-label={`Rated ${product.ratingAverage.toFixed(1)} out of 5 from ${product.ratingCount} ratings`}><span className="text-amber-500" aria-hidden="true">★</span><span className="font-semibold text-gray-700">{product.ratingAverage.toFixed(1)}</span><span className="text-gray-400">({product.ratingCount})</span></div>}
        {product.dietaryLifestyle?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{product.dietaryLifestyle.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-800">{tag}</span>)}</div>}

        <div className="mt-3 flex min-h-7 items-baseline gap-2">
          <span className="text-base font-extrabold text-gray-900">{formatKES(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatKES(product.compareAtPrice)}</span>
          )}
        </div>

        <div className="mt-3">
          {outOfStock ? (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-400"
            >
              Unavailable
            </button>
          ) : cartItem ? (
            <div className="flex justify-center">
              <QuantityStepper
                quantity={cartItem.quantity}
                max={product.stock}
                onChange={(q) => updateQuantity(product._id, q)}
                size="sm"
              />
            </div>
          ) : (
            <button
              onClick={() => addItem(product, 1)}
              className="w-full rounded-xl bg-brand-700 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
      <QuickView product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </article>
  );
}
