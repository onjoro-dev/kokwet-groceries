import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatKES } from "../utils";
import QuantityStepper from "../components/ui/QuantityStepper";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

/** Full-page cart view — same data as the drawer, useful as a direct link and on mobile. */
export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        slot="emptyCart"
        title="Your cart is empty"
        description="Browse our categories and add a few groceries to get started."
        action={
          <Link to="/">
            <Button>Start shopping</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-5">Your cart ({itemCount} items)</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="flex gap-4 p-3 border border-gray-100 rounded-xl shadow-card">
              <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover bg-gray-50" />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${product.slug}`} className="font-medium text-gray-800 hover:text-brand-700 line-clamp-2">
                  {product.name}
                </Link>
                <p className="text-xs text-gray-400">{product.unit}</p>
                <div className="flex items-center justify-between mt-3">
                  <QuantityStepper quantity={quantity} max={product.stock} onChange={(q) => updateQuantity(product._id, q)} />
                  <span className="font-bold text-brand-700">{formatKES(product.price * quantity)}</span>
                </div>
              </div>
              <button
                onClick={() => removeItem(product._id)}
                className="text-gray-300 hover:text-red-500 self-start text-xl"
                aria-label={`Remove ${product.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit border border-gray-100 rounded-xl shadow-card p-5 space-y-4">
          <h2 className="font-bold text-gray-800">Order summary</h2>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-800">{formatKES(subtotal)}</span>
          </div>
          <p className="text-xs text-gray-400">Delivery fee is calculated at checkout based on your order size.</p>
          <Link to="/checkout">
            <Button fullWidth size="lg">
              Proceed to checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
