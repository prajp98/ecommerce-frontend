import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";

type OrderItem = {
  orderItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  totalPrice: number;
};

type OrderResponse = {
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

type OrderResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: OrderResponse;
};

export default function OrderDetailsPage() {
  const { orderId } = useParams();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        setError("");

        const response = await api.get<OrderResponseWrapper>(`/orders/${orderId}`);
        setOrder(response.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="space-y-4">
          <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
          <div className="h-32 animate-pulse rounded-3xl bg-gray-200" />
          <div className="h-40 animate-pulse rounded-3xl bg-gray-200" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        title="Order details"
        subtitle="View your order summary and purchased items."
        action={
          <Link to="/orders">
            <Button variant="secondary">Back to orders</Button>
          </Link>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {!order ? (
        <Card>
          <p className="text-sm text-gray-500">No order found.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-black">
                  {order.orderNumber}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  {order.addressLine1}
                  {order.addressLine2 ? `, ${order.addressLine2}` : ""},{" "}
                  {order.city}, {order.state} - {order.zipCode}, {order.country}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Payment: {order.paymentMethod}
                </p>
              </div>

              <div className="text-left md:text-right">
                <OrderStatusBadge status={order.status} />

                <p className="mt-3 text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-black">₹{order.totalAmount}</p>

                <p className="mt-2 text-xs text-gray-400">
                  Internal ID: {order.orderId}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-black">Items</h3>

            <div className="mt-4 space-y-3">
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
          </Card>
        </div>
      )}
    </section>
  );
}