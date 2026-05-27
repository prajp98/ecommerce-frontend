type OrderStatusBadgeProps = {
  status: string;
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const normalized = status.toUpperCase();

  const styles =
    normalized === "DELIVERED"
      ? "bg-green-100 text-green-700"
      : normalized === "CANCELLED"
      ? "bg-red-100 text-red-700"
      : normalized === "SHIPPED"
      ? "bg-blue-100 text-blue-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles}`}
    >
      {normalized}
    </span>
  );
}