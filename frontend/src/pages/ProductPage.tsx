import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Product } from "../types";
import { getProductBySlug } from "../services/productService";
import { formatKES, discountPercent } from "../utils";
import { useCart } from "../context/CartContext";
import Button from "../components/ui/Button";
import QuantityStepper from "../components/ui/QuantityStepper";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import ProductGrid from "../components/product/ProductGrid";
import BrandVisual from "../components/ui/BrandVisual";
import Modal from "../components/ui/Modal";
import { resolveMediaUrl } from "../utils/media";

/** Full product detail page: image, price, stock, delivery promise, and related items. */
export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageOpen, setImageOpen] = useState(false);
  const { items, addItem, updateQuantity } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug)
      .then((res) => {
        setProduct(res.product);
        setRelated(res.related);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Product not found.</p>
        <Link to="/" className="text-brand-700 font-semibold hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.compareAtPrice);
  const cartItem = items.find((i) => i.product._id === product._id);
  const category = typeof product.category === "object" ? product.category : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <nav className="text-xs text-gray-400 mb-4">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        {category && (
          <>
            {" / "}
            <Link to={`/category/${category.slug}`} className="hover:text-brand-700">
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
          <button
            type="button"
            onClick={() => setImageOpen(true)}
            aria-label={`View larger image of ${product.name}`}
            className="h-full w-full cursor-zoom-in p-3"
          >
            <img src={resolveMediaUrl(product.image)} alt={product.name} className="w-full h-full object-contain" />
          </button>
          {discount && (
            <span className="absolute top-3 left-3 bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
              Save {discount}%
            </span>
          )}
        </div>

        <div>
          {product.brand && <p className="text-sm text-gray-400 font-medium">{product.brand}</p>}
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{product.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{product.unit}</p>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-extrabold text-brand-700">{formatKES(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-gray-400 line-through">{formatKES(product.compareAtPrice)}</span>
            )}
          </div>

          <div className="mt-3">
            {product.stock > 0 ? (
              product.stock <= 5 ? (
                <Badge color="orange">Only {product.stock} left in stock</Badge>
              ) : (
                <Badge color="green">In stock</Badge>
              )
            ) : (
              <Badge color="red">Out of stock</Badge>
            )}
          </div>

          <p className="text-gray-600 text-sm mt-5 leading-relaxed">{product.description}</p>

          <div className="mt-6">
            {product.stock <= 0 ? (
              <Button disabled fullWidth size="lg">
                Out of stock
              </Button>
            ) : cartItem ? (
              <div className="flex items-center gap-4">
                <QuantityStepper
                  quantity={cartItem.quantity}
                  max={product.stock}
                  onChange={(q) => updateQuantity(product._id, q)}
                />
                <span className="text-sm text-gray-500">In your cart</span>
              </div>
            ) : (
              <Button size="lg" onClick={() => addItem(product, 1)} fullWidth className="sm:w-auto">
                Add to cart — {formatKES(product.price)}
              </Button>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-5 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <BrandVisual slot="productDelivery" fallback="🚚" className="h-7 w-7 text-lg" imageClassName="h-full w-full rounded object-cover" />
              Same-day delivery across Kitale Town when ordered before 4pm
            </div>
            <div className="flex items-center gap-3">
              <BrandVisual slot="productPayment" fallback="💳" className="h-7 w-7 text-lg" imageClassName="h-full w-full rounded object-cover" />
              Pay by M-Pesa
            </div>
            <div className="flex items-center gap-3">
              <BrandVisual slot="productReturn" fallback="↩️" className="h-7 w-7 text-lg" imageClassName="h-full w-full rounded object-cover" />
              Freshness guaranteed — free replacement for damaged items
            </div>
          </div>
        </div>
      </div>

      <Modal open={imageOpen} title={product.name} description="Product image" onClose={() => setImageOpen(false)} size="lg">
        <div className="flex max-h-[72vh] items-center justify-center bg-gray-50">
          <img src={resolveMediaUrl(product.image)} alt={product.name} className="max-h-[72vh] max-w-full object-contain" />
        </div>
      </Modal>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-bold text-gray-800 mb-4">You might also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
