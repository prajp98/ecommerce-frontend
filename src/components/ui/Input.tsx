import { type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black ${className}`}
      {...props}
    />
  );
}