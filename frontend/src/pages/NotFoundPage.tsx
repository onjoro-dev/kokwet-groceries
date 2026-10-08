import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import BrandVisual from "../components/ui/BrandVisual";

/** Generic 404 page for any unmatched route. */
export default function NotFoundPage() {
  return (
    <div className="text-center py-24 px-4">
      <BrandVisual slot="notFound" fallback="🧭" className="mx-auto mb-4 h-16 w-16 text-5xl" imageClassName="h-full w-full rounded-lg object-cover" />
      <h1 className="text-xl font-bold text-gray-800">Page not found</h1>
      <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/" className="inline-block mt-6">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
