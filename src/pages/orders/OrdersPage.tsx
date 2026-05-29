import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import { useToast } from "../../components/ui/Toast";
import OrderCard from "../../components/orders/OrderCard";
import type { Order, OrdersResponseWrapper } from "../../types/order";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<OrdersResponseWrapper>("/orders/me");
      setOrders(response.data.data);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load orders";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-40 animate-pulse rounded-3xl bg-gray-200" />
          <div className="h-40 animate-pulse rounded-3xl bg-gray-200" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <PageHeader
        title="Orders"
        subtitle="Track your past orders and view details."
        action={
          <Button variant="secondary" onClick={fetchOrders}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          title="You have no orders yet"
          description="Start shopping and your orders will appear here."
          action={
            <Link to="/products">
              <Button>Start shopping</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              actions={
                <div className="flex flex-wrap gap-3">
                  <Link to={`/orders/${order.orderId}`}>
                    <Button variant="secondary">View details</Button>
                  </Link>
                </div>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}