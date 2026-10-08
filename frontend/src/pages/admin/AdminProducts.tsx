import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../types";
import { getAdminProducts, deleteProduct } from "../../services/productService";
import { formatKES } from "../../utils";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

/** Product management list — the main screen for adding, editing, and removing items from the store. */
export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getAdminProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProduct(toDelete._id);
      setProducts((prev) => prev.filter((p) => p._id !== toDelete._id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">{products.length} product(s) in your store</p>
        </div>
        <Link to="/admin/products/new">
          <Button>+ Add product</Button>
        </Link>
      </div>

      {products.filter((product) => product.stock <= (product.lowStockThreshold ?? 5)).length > 0 && (
        <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          <strong>Low stock alert:</strong> {products.filter((product) => product.stock <= (product.lowStockThreshold ?? 5)).map((product) => `${product.name} (${product.stock} left)`).join(", ")}
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          slot="emptyProducts"
          title="No products yet"
          description="Add your first product to start selling."
          action={
            <Link to="/admin/products/new">
              <Button>+ Add product</Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-card overflow-hidden">
          {/* Table on larger screens */}
          <table className="w-full text-sm hidden sm:table">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                      <span className="font-medium text-gray-800 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {typeof p.category === "object" ? p.category.name : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-700">{formatKES(p.price)}</td>
                  <td className="px-4 py-3">
                    {p.stock <= (p.lowStockThreshold ?? 5) ? <Badge color="orange">{p.stock} left · low</Badge> : <span>{p.stock}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {p.isActive ? <Badge color="green">Active</Badge> : <Badge color="gray">Hidden</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <Link to={`/admin/products/${p._id}/edit`} className="text-brand-700 font-semibold hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => setToDelete(p)} className="text-red-500 font-semibold hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Cards on small screens */}
          <div className="sm:hidden divide-y divide-gray-100">
            {products.map((p) => (
              <div key={p._id} className="p-4 flex gap-3">
                <img src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-gray-50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                  <p className="text-sm text-brand-700 font-semibold">{formatKES(p.price)}</p>
                  <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                  <div className="flex gap-4 mt-2">
                    <Link to={`/admin/products/${p._id}/edit`} className="text-sm text-brand-700 font-semibold">
                      Edit
                    </Link>
                    <button onClick={() => setToDelete(p)} className="text-sm text-red-500 font-semibold">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this product?"
          message={`"${toDelete.name}" will be permanently removed from your store. This can't be undone.`}
          confirmLabel="Yes, delete"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
