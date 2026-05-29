import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";
import OrderCard from "../../components/orders/OrderCard";
import type {
  Order,
  OrdersResponseWrapper,
  OrderResponseWrapper,
} from "../../types/order";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrdersAdminPage() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<OrdersResponseWrapper>("/orders");
      const data = response.data.data;

      setOrders(data);

      const nextStatusMap: Record<number, string> = {};
      data.forEach((order) => {
        nextStatusMap[order.orderId] = order.status;
      });
      setStatusMap(nextStatusMap);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load orders";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId: number, value: string) => {
    setStatusMap((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const handleUpdateStatus = async (orderId: number) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const status = statusMap[orderId];

      await api.patch<OrderResponseWrapper>(`/orders/${orderId}/status`, {
        status,
      });

      await fetchOrders();
      showToast("Order status updated successfully", "success");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to update order status";
      setError(message);
      showToast(message, "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="View all customer orders and update order status."
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

      {loading ? (
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-40 animate-pulse rounded-3xl bg-gray-200" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Orders will appear here once customers start placing them."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              showCustomer
              rightContent={
                <>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-black">
                    ₹{order.totalAmount}
                  </p>
                </>
              }
              actions={
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <select
                    value={statusMap[order.orderId] || order.status}
                    onChange={(e) =>
                      handleStatusChange(order.orderId, e.target.value)
                    }
                    className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={() => handleUpdateStatus(order.orderId)}
                    disabled={updatingOrderId === order.orderId}
                  >
                    {updatingOrderId === order.orderId
                      ? "Updating..."
                      : "Update status"}
                  </Button>

                  <Link to={`/orders/${order.orderId}`}>
                    <Button variant="secondary">View details</Button>
                  </Link>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}