import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import { useToast } from "../../components/ui/Toast";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";

type OrderItem = {
  orderItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  totalPrice: number;
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
  orderItems: OrderItem[];
  createdAt: string;
};

type OrdersResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Order[];
};

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
            <Card key={order.orderId}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-black">
                      {order.orderNumber}
                    </h2>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {order.addressLine1}
                    {order.addressLine2 ? `, ${order.addressLine2}` : ""},{" "}
                    {order.city}, {order.state} - {order.zipCode},{" "}
                    {order.country}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Payment: {order.paymentMethod}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-black">
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={`/orders/${order.orderId}`}>
                  <Button variant="secondary">View details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}