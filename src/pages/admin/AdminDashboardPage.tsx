import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

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
        setError(err?.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!loading && stats.categories === 0 && stats.products === 0 && stats.orders === 0 && !error) {
    return (
      <EmptyState
        title="Admin dashboard"
        description="Use the menu to manage your store."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Quick overview of your store."
        action={
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <Card>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </Card>
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
              <Link to="/admin/categories">
                <Button>Manage categories</Button>
              </Link>
              <Link to="/admin/products">
                <Button variant="secondary">Manage products</Button>
              </Link>
              <Link to="/admin/images">
                <Button variant="secondary">Manage images</Button>
              </Link>
              <Link to="/admin/orders">
                <Button variant="secondary">Manage orders</Button>
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