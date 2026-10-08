import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Category } from "../types";
import { getCategories } from "../services/categoryService";
import Spinner from "../components/ui/Spinner";
import CategoryArtwork from "../components/category/CategoryArtwork";

/** Full-page list of all categories — the mobile "Categories" tab destination. */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-lg font-bold text-gray-800 mb-5">All categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/category/${cat.slug}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 shadow-card hover:bg-brand-50 transition-colors"
          >
            <CategoryArtwork category={cat} className="h-10 w-10 object-cover text-3xl" />
            <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
