import { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../types";
import { formatKES } from "../../utils";
import { useCart } from "../../context/CartContext";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import { resolveMediaUrl } from "../../utils/media";

export default function QuickView({ product, open, onClose }: { product: Product | null; open: boolean; onClose: () => void }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  if (!product) return null;
  const add = () => { addItem(product, 1); setAdded(true); window.setTimeout(() => setAdded(false), 1300); };
  return <Modal open={open} title={product.name} description={`${product.brand || "Kokwet Fresh Farm"} · ${product.unit}`} onClose={onClose}><div className="grid gap-5 sm:grid-cols-[180px_1fr]"><div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-3 sm:h-48 sm:aspect-auto"><img src={resolveMediaUrl(product.image)} alt={product.name} className="h-full w-full object-contain" /></div><div><div className="flex items-baseline gap-2"><span className="text-2xl font-extrabold text-brand-700">{formatKES(product.price)}</span>{product.compareAtPrice && <span className="text-sm text-gray-400 line-through">{formatKES(product.compareAtPrice)}</span>}</div><p className="mt-2 text-sm leading-6 text-gray-600">{product.description}</p><div className="mt-4 flex flex-wrap gap-2">{product.dietaryLifestyle?.slice(0, 3).map((tag) => <Badge key={tag} color="green">{tag}</Badge>)}<Badge color={product.stock <= 5 ? "orange" : "green"}>{product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}</Badge></div><div className="mt-6 flex gap-3"><Button fullWidth onClick={add} disabled={product.stock <= 0}>{added ? "Added to cart ✓" : product.stock <= 0 ? "Out of stock" : "Add to cart"}</Button><Link to={`/product/${product.slug}`} onClick={onClose} className="shrink-0"><Button variant="outline">View details</Button></Link></div></div></div></Modal>;
}
