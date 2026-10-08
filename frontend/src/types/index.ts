// Shared TypeScript types for the whole frontend. Keep these in sync with the
// backend Mongoose models in backend/src/models — same shapes, just as plain data.

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  order: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: Category | string;
  price: number;
  compareAtPrice?: number;
  unit: string;
  image: string;
  images: string[];
  stock: number;
  lowStockThreshold: number;
  brand?: string;
  dietaryLifestyle: string[];
  isFeatured: boolean;
  isActive: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdAt?: string;
}

export interface Address {
  _id?: string;
  label: string;
  area: string;
  landmark: string;
  phone?: string;
  recipientName?: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin" | "storekeeper" | "delivery_officer";
  employment?: { employeeId?: string; jobTitle?: string; startDate?: string; salary?: number; motorcyclePlate?: string };
  addresses: Address[];
  token?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "mpesa";

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | { _id: string; name: string; email: string; phone: string };
  items: OrderItem[];
  deliveryAddress: {
    area: string;
    landmark: string;
    phone: string;
    recipientName: string;
    mapsUrl?: string;
    latitude?: number;
    longitude?: number;
  };
  itemsTotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed";
  mpesa?: { phone?: string; amount?: number; checkoutRequestId?: string; resultDescription?: string; receiptNumber?: string };
  paymentReviewRequired?: boolean;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: string }[];
  notes?: string;
  createdAt: string;
}

export interface ProductListResponse {
  products: Product[];
  page: number;
  pages: number;
  total: number;
  facets?: {
    brands: string[];
    dietaryLifestyle: string[];
    categories: Pick<Category, "_id" | "name" | "slug">[];
  };
}

export interface ProductPromotions {
  newArrivals: Product[];
  trending: Product[];
  megaSales: Product[];
}
