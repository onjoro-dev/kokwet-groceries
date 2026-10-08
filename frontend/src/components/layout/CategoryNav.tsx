import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Category } from "../../types";
import { getCategories } from "../../services/categoryService";
import CategoryArtwork from "../category/CategoryArtwork";

/** Horizontally-scrollable category shortcuts shown under the header, like Carrefour's category strip. */
export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { slug } = useParams();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <ul className="flex gap-1 overflow-x-auto no-scrollbar py-2">
          {categories.map((cat) => (
            <li key={cat._id} className="shrink-0">
              <Link
                to={`/category/${cat.slug}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  slug === cat.slug
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                <CategoryArtwork category={cat} className="h-5 w-5 object-cover" />
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
