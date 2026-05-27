import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
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

type OrderListResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Order[];
};

type OrderResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Order;
};

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
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<OrderListResponseWrapper>("/orders");
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
        <Card>
          <p className="text-sm text-gray-500">Loading orders...</p>
        </Card>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Orders will appear here once customers start placing them."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.orderId}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-black">
                      {order.orderNumber}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Customer: {order.userEmail}
                  </p>

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

                <div className="text-left lg:text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-black">
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
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

                <Button
                  variant="secondary"
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order.orderId ? null : order.orderId
                    )
                  }
                >
                  {expandedOrderId === order.orderId
                    ? "Hide items"
                    : "View items"}
                </Button>

                <Link to={`/orders/${order.orderId}`}>
                  <Button variant="secondary">View details</Button>
                </Link>
              </div>

              {expandedOrderId === order.orderId && (
                <div className="mt-5 space-y-3 border-t pt-5">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.orderItemId}
                      className="flex flex-col gap-2 rounded-2xl bg-gray-50 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-black">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ₹{item.priceAtPurchase}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-black">
                        ₹{item.totalPrice}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}