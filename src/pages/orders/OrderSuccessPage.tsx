import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Alert from "../../components/ui/Alert";

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

type OrderSuccessState = {
  orderNumber?: string;
  totalAmount?: number;
  paymentMethod?: string;
};

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const state = location.state as OrderSuccessState | null;

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
        const message =
          err?.response?.data?.message || "Failed to load order details";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const displayOrderNumber = order?.orderNumber || state?.orderNumber;
  const displayTotalAmount = order?.totalAmount ?? state?.totalAmount;
  const displayPaymentMethod = order?.paymentMethod || state?.paymentMethod;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        title="Order placed successfully"
        subtitle="Thank you for shopping with us."
      />

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your order has been confirmed.
          </p>

          {loading ? (
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Loading order details...</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-lg font-semibold text-black">
                  {displayOrderNumber || `#${orderId ?? "N/A"}`}
                </p>
                {order?.orderId && (
                  <p className="mt-1 text-xs text-gray-400">
                    Internal ID: {order.orderId}
                  </p>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {displayTotalAmount !== undefined && (
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="mt-1 text-lg font-semibold text-black">
                      ₹{displayTotalAmount}
                    </p>
                  </div>
                )}

                {displayPaymentMethod && (
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="mt-1 text-lg font-semibold text-black">
                      {displayPaymentMethod}
                    </p>
                  </div>
                )}
              </div>

              {order?.status && (
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="mt-1 text-lg font-semibold text-black">
                    {order.status}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600">
                You will receive updates about your order in the Orders page.
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/orders">
              <Button>View orders</Button>
            </Link>

            <Link to="/products">
              <Button variant="secondary">Continue shopping</Button>
            </Link>
          </div>
        </div>
      </Card>
    </section>
  );
}