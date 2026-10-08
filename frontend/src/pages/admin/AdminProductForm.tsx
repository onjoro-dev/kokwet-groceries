import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Category, Product } from "../../types";
import { getCategories } from "../../services/categoryService";
import { createProduct, updateProduct, getAdminProducts, uploadProductImage } from "../../services/productService";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

/**
 * Single form used for both adding a new product and editing an existing one.
 * Kept as plain labelled fields (no jargon) so shop staff can fill it in confidently.
 */
export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [unit, setUnit] = useState("1 piece");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [stock, setStock] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState(() => {
    try { return String(JSON.parse(localStorage.getItem("kokwet_brand") || "{}").lowStockThreshold ?? 5); } catch { return "5"; }
  });
  const [brand, setBrand] = useState("");
  const [dietaryLifestyle, setDietaryLifestyle] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!imageFile) { setImagePreview(image); return; }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image, imageFile]);

  useEffect(() => {
    if (!id) return;
    // The admin edit form is loaded from the full admin product list, since we only
    // have an id here (not a slug). This keeps the API surface small and simple.
    getAdminProducts().then((products) => {
      const product = products.find((p) => p._id === id);
      if (product) fillForm(product);
      setLoading(false);
    });
  }, [id]);

  const fillForm = (p: Product) => {
    setName(p.name);
    setDescription(p.description);
    setCategory(typeof p.category === "object" ? p.category._id : p.category);
    setPrice(String(p.price));
    setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : "");
    setUnit(p.unit);
    setImage(p.image);
    setStock(String(p.stock));
    setLowStockThreshold(String(p.lowStockThreshold ?? 5));
    setBrand(p.brand || "");
    setDietaryLifestyle((p.dietaryLifestyle || []).join(", "));
    setIsFeatured(p.isFeatured);
    setIsActive(p.isActive);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      name,
      description,
      category,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      unit,
      image,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      brand: brand || undefined,
      dietaryLifestyle: dietaryLifestyle.split(",").map((tag) => tag.trim()).filter(Boolean),
      isFeatured,
      isActive,
    };

    try {
      if (imageFile) payload.image = await uploadProductImage(imageFile);
      if (!payload.image) throw new Error("Choose a product image before saving.");
      if (isEditing && id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">{isEditing ? "Edit product" : "Add a new product"}</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl shadow-card p-5 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-600">Product name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ripe Tomatoes"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Category</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:border-brand-400 outline-none"
            >
              <option value="" disabled>
                Choose a category
              </option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Unit</label>
            <input
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. 1 kg, 500 ml, 1 piece"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Selling price (KSh)</label>
            <input
              required
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Original price (optional)</label>
            <input
              type="number"
              min={0}
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="For showing a discount"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Stock quantity</label>
            <input
              required
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Low stock alert at</label>
            <input type="number" min={0} value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Brand (optional)</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Dietary & lifestyle labels (optional)</label>
            <input value={dietaryLifestyle} onChange={(e) => setDietaryLifestyle(e.target.value)} placeholder="Organic, Vegan, Gluten free" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none" />
            <p className="mt-1 text-xs text-gray-500">Separate labels with commas. Customers can filter by these labels.</p>
          </div>
        </div>

        <div>
          <div>
            <label htmlFor="product-image" className="text-sm font-medium text-gray-600">Product photo</label>
            <input
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              capture="environment"
              required={!image}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0] || null;
                setImageFile(file);
                if (file && file.size > 5 * 1024 * 1024) {
                  setError("Product images must be 5 MB or smaller.");
                  setImageFile(null);
                  event.target.value = "";
                  return;
                }
                setError("");
              }}
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700"
            />
            <p className="mt-1 text-xs text-gray-500">Select or take a JPEG, PNG, WebP or GIF photo (maximum 5 MB).</p>
          </div>
        </div>

        {imagePreview && (
          <div className="flex items-center gap-3">
            <img src={imagePreview} alt="Product photo preview" className="h-24 w-24 rounded-lg border border-gray-100 object-cover" />
            <span className="text-xs text-gray-500">{imageFile ? imageFile.name : "Current product photo"}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Show on homepage ("Today's picks")
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Visible to customers
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEditing ? "Save changes" : "Add product"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
