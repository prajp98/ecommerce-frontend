import { type ReactNode } from "react";

type AlertProps = {
  children: ReactNode;
  variant?: "error" | "success" | "info";
};

export default function Alert({ children, variant = "info" }: AlertProps) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm ${styles[variant]}`}
    >
      {children}
    </div>
  );
}