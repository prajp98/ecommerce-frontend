import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import { useToast } from "../../components/ui/Toast";

type Category = {
  id: number;
  name: string;
  description: string;
  active: boolean;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  active: boolean;
};

type Order = {
  orderId: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  userId: number;
  userEmail: string;
  addressId: number;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: string;
  orderItems: unknown[];
  createdAt: string;
};

type ListResponseWrapper<T> = {
  timestamp: string;
  status: number;
  message: string;
  data: T;
};

export default function AdminHomePage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    categories: 0,
    activeCategories: 0,
    products: 0,
    activeProducts: 0,
    orders: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const [categoriesRes, productsRes, ordersRes] = await Promise.all([
          api.get<ListResponseWrapper<Category[]>>("/categories"),
          api.get<ListResponseWrapper<Product[]>>("/products"),
          api.get<ListResponseWrapper<Order[]>>("/orders"),
        ]);

        const categories = categoriesRes.data.data;
        const products = productsRes.data.data;
        const orders = ordersRes.data.data;

        setStats({
          categories: categories.length,
          activeCategories: categories.filter((c) => c.active).length,
          products: products.length,
          activeProducts: products.filter((p) => p.active).length,
          orders: orders.length,
          pendingOrders: orders.filter((o) => o.status === "PENDING").length,
        });
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "Failed to load dashboard stats";
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-black">
          Dashboard
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Quick overview of your store.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Categories"
              value={stats.categories}
              subtitle={`${stats.activeCategories} active`}
              href="/admin/categories"
            />
            <StatCard
              title="Products"
              value={stats.products}
              subtitle={`${stats.activeProducts} active`}
              href="/admin/products"
            />
            <StatCard
              title="Orders"
              value={stats.orders}
              subtitle={`${stats.pendingOrders} pending`}
              href="/admin/orders"
            />
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-black">Quick actions</h3>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/admin/categories"
                className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Manage categories
              </Link>
              <Link
                to="/admin/products"
                className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Manage products
              </Link>
              <Link
                to="/admin/images"
                className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Manage images
              </Link>
              <Link
                to="/admin/orders"
                className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Manage orders
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  href,
}: {
  title: string;
  value: number;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
        {title}
      </p>
      <p className="mt-3 text-3xl font-bold text-black">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </Link>
  );
}