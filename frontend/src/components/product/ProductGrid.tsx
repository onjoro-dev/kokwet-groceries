import { Product } from "../../types";
import ProductCard from "./ProductCard";
import EmptyState from "../ui/EmptyState";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  query?: string;
}

/** Responsive grid of product cards: 2 columns on phones, up to 5 on large screens. */
export default function ProductGrid({ products, emptyMessage, query }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        slot="emptySearch"
        icon="🔍"
        title="No products found"
        description={emptyMessage || "Try a different search term or browse another category."}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} query={query} />
      ))}
    </div>
  );
}
