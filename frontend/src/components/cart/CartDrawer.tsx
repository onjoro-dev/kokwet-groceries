import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatKES } from "../../utils";
import QuantityStepper from "../ui/QuantityStepper";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";

/**
 * Slide-over cart preview. Opens automatically when an item is added, and from the
 * header cart button, so shoppers always know what's in their basket without leaving the page.
 */
export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-xl animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-800">Your cart ({itemCount})</h2>
          <button onClick={closeCart} className="text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Close">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <EmptyState
              slot="emptyCart"
              title="Your cart is empty"
              description="Add some groceries to get started."
              action={
                <Button onClick={closeCart} variant="outline">
                  Continue shopping
                </Button>
              }
            />
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li key={product._id} className="flex gap-3">
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.unit}</p>
                    <div className="flex items-center justify-between mt-2">
                      <QuantityStepper
                        quantity={quantity}
                        max={product.stock}
                        onChange={(q) => updateQuantity(product._id, q)}
                        size="sm"
                      />
                      <span className="font-semibold text-brand-700 text-sm">
                        {formatKES(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(product._id)}
                    aria-label={`Remove ${product.name}`}
                    className="text-gray-300 hover:text-red-500 self-start"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">{formatKES(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-400">Delivery fee is calculated at checkout.</p>
            <Link to="/checkout" onClick={closeCart}>
              <Button fullWidth size="lg">
                Go to checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
