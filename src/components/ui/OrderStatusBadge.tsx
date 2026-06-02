type OrderStatusBadgeProps = {
  status: string;
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();

  const badgeClass =
    normalizedStatus === "DELIVERED"
      ? "bg-green-100 text-green-700"
      : normalizedStatus === "CANCELLED"
      ? "bg-red-100 text-red-700"
      : normalizedStatus === "SHIPPED"
      ? "bg-blue-100 text-blue-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}
    >
      {normalizedStatus}
    </span>
  );
}