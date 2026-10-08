import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/ui/Toast";

import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/admin/AdminLayout";

import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import SearchPage from "./pages/SearchPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import HelpPage from "./pages/HelpPage";
import NotFoundPage from "./pages/NotFoundPage";

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminStaff = lazy(() => import("./pages/admin/AdminStaff"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminStatistics = lazy(() => import("./pages/admin/AdminStatistics"));
const AdminFinancialRecords = lazy(() => import("./pages/admin/AdminFinancialRecords"));
const AdminReceipt = lazy(() => import("./pages/admin/AdminReceipt"));
const StaffLogin = lazy(() => import("./pages/admin/StaffLogin"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const SocialCallback = lazy(() => import("./pages/SocialCallback"));

/**
 * All routing lives here in one place, split into three groups:
 *  1. The customer storefront, wrapped in AppLayout (header, cart drawer, etc.)
 *  2. The admin dashboard, wrapped in AdminLayout (sidebar, admin-only guard)
 *  3. The admin login page, which intentionally has no layout chrome around it
 */
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center bg-white"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" role="status" aria-label="Loading page" /></div>}>
              <Routes>
                <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/social-callback" element={<SocialCallback />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/help/:topic" element={<HelpPage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/staff/storekeeper/login" element={<StaffLogin expectedRole="storekeeper" />} />
            <Route path="/staff/delivery-officer/login" element={<StaffLogin expectedRole="delivery_officer" />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="statistics" element={<AdminStatistics />} />
              <Route path="financial-records" element={<AdminFinancialRecords />} />
              <Route path="receipts/:id" element={<AdminReceipt />} />
              <Route path="activity" element={<AdminActivity />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
