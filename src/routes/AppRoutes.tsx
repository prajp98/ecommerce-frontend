import { Route, Routes } from "react-router";
import AppLayout from "../components/layout/AppLayout";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ProductsPage from "../pages/products/ProductsPage";
import ProductDetailPage from "../pages/products/ProductDetailPage";
import CartPage from "../pages/cart/CartPage";
import AddressesPage from "../pages/addresses/AddressesPage";
import CheckoutPage from "../pages/orders/CheckoutPage";

function OrdersPage() {
  return <div className="mx-auto max-w-7xl px-4 py-10">Orders page</div>;
}

function AdminPage() {
  return <div className="mx-auto max-w-7xl px-4 py-10">Admin dashboard</div>;
}

function NotFoundPage() {
  return <div className="mx-auto max-w-7xl px-4 py-10">Page not found</div>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/addresses" element={<AddressesPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}