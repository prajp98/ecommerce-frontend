import { Link, useParams } from "react-router";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

export default function OrderSuccessPage() {
  const { orderId } = useParams();

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

          {orderId && (
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-lg font-semibold text-black">{orderId}</p>
            </div>
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