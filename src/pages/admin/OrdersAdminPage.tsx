import { useEffect, useState } from "react";
import { api } from "../../lib/api";

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

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersAdminPage() {
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
      setError(err?.response?.data?.message || "Failed to load orders");
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
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-black">Orders</h2>
        <p className="mt-2 text-sm text-gray-500">
          View all customer orders and update order status.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? "Loading orders..." : `${orders.length} orders found`}
        </p>

        <button
          onClick={fetchOrders}
          className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          Loading...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="rounded-3xl border border-gray-200 bg-white p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-black">
                      {order.orderNumber}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        order.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : order.status === "SHIPPED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Customer: {order.userEmail}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {order.addressLine1}
                    {order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city},{" "}
                    {order.state} - {order.zipCode}, {order.country}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Payment: {order.paymentMethod}
                  </p>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-black">₹{order.totalAmount}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
                <select
                  value={statusMap[order.orderId] || order.status}
                  onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleUpdateStatus(order.orderId)}
                  disabled={updatingOrderId === order.orderId}
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingOrderId === order.orderId ? "Updating..." : "Update status"}
                </button>

                <button
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order.orderId ? null : order.orderId
                    )
                  }
                  className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  {expandedOrderId === order.orderId ? "Hide items" : "View items"}
                </button>
              </div>

              {expandedOrderId === order.orderId && (
                <div className="mt-5 space-y-3 border-t pt-5">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.orderItemId}
                      className="flex flex-col gap-2 rounded-2xl bg-gray-50 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-black">{item.productName}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}