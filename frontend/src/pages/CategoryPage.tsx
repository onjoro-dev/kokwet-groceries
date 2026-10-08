import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Product, Category } from "../types";
import { getProducts } from "../services/productService";
import { getCategoryBySlug } from "../services/categoryService";
import ProductGrid from "../components/product/ProductGrid";
import Spinner from "../components/ui/Spinner";
import CategoryArtwork from "../components/category/CategoryArtwork";

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
];

/** Product listing for a single category, with a sort control — mirrors the category pages on Carrefour. */
export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getCategoryBySlug(slug)
      .then((cat) => {
        setCategory(cat);
        return getProducts({ category: cat._id, sort: sort || undefined, limit: 40 });
      })
      .then((res) => setProducts(res.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [slug, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-5 gap-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {category && <CategoryArtwork category={category} className="h-8 w-8 object-cover text-2xl" />}
          {category?.name || "Loading..."}
        </h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-brand-400 outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : (
        <ProductGrid products={products} emptyMessage="This category has no products yet." />
      )}
    </div>
  );
}
