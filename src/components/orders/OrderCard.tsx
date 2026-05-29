import { Link } from "react-router";
import Button from "../ui/Button";
import Card from "../ui/Card";
import OrderStatusBadge from "../ui/OrderStatusBadge";
import type { Order } from "../../types/order";

type OrderCardProps = {
  order: Order;
  rightContent?: React.ReactNode;
  actions?: React.ReactNode;
  showCustomer?: boolean;
};

export default function OrderCard({
  order,
  rightContent,
  actions,
  showCustomer = false,
}: OrderCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-black">
              {order.orderNumber}
            </h3>
            <OrderStatusBadge status={order.status} />
          </div>

          {showCustomer && (
            <p className="mt-2 text-sm text-gray-500">
              Customer: {order.userEmail}
            </p>
          )}

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
          {rightContent ? (
            rightContent
          ) : (
            <>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-black">₹{order.totalAmount}</p>
            </>
          )}
        </div>
      </div>

      {actions && <div className="mt-6">{actions}</div>}
    </Card>
  );
}