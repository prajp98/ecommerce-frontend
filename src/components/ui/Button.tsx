import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 " +
    "cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 hover:-translate-y-0.5 hover:shadow-sm";

  const styles = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}