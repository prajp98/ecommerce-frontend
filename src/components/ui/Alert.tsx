import { type ReactNode } from "react";

type AlertProps = {
  children: ReactNode;
  variant?: "error" | "success" | "info";
};

export default function Alert({ children, variant = "info" }: AlertProps) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-600",
    success: "border-green-200 bg-green-50 text-green-700",
    info: "border-gray-200 bg-gray-50 text-gray-700",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[variant]}`}>
      {children}
    </div>
  );
}