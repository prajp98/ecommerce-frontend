import { Link, useLocation, useParams } from "react-router";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

type OrderSuccessState = {
  orderNumber?: string;
  totalAmount?: number;
  paymentMethod?: string;
};

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const state = location.state as OrderSuccessState | null;

  const orderNumber = state?.orderNumber;
  const totalAmount = state?.totalAmount;
  const paymentMethod = state?.paymentMethod;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        title="Order placed successfully"
        subtitle="Thank you for shopping with us."
      />

      <Card>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your order has been confirmed.
          </p>

          {orderNumber ? (
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-lg font-semibold text-black">{orderNumber}</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-lg font-semibold text-black">
                {orderId ?? "N/A"}
              </p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {totalAmount !== undefined && (
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="mt-1 text-lg font-semibold text-black">
                  ₹{totalAmount}
                </p>
              </div>
            )}

            {paymentMethod && (
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="mt-1 text-lg font-semibold text-black">
                  {paymentMethod}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600">
            You will receive updates about your order in the Orders page.
          </div>

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