import { Route, Routes } from "react-router";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ProductsPage from "../pages/products/ProductsPage";
import ProductDetailPage from "../pages/products/ProductDetailPage";
import CartPage from "../pages/cart/CartPage";
import AddressesPage from "../pages/addresses/AddressesPage";
import CheckoutPage from "../pages/orders/CheckoutPage";
import OrdersPage from "../pages/orders/OrdersPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminHomePage from "../pages/admin/AdminHomePage";
import CategoriesAdminPage from "../pages/admin/CategoriesAdminPage";
import ProductsAdminPage from "../pages/admin/ProductsAdminPage";
import ProductImagesAdminPage from "../pages/admin/ProductImagesAdminPage";
import OrdersAdminPage from "../pages/admin/OrdersAdminPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/addresses" element={<AddressesPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboardPage />}>
          <Route index element={<AdminHomePage />} />
          <Route path="categories" element={<CategoriesAdminPage />} />
          <Route path="products" element={<ProductsAdminPage />} />
          <Route path="images" element={<ProductImagesAdminPage />} />
          <Route path="orders" element={<OrdersAdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-10">Page not found</div>} />
    </Routes>
  );
}