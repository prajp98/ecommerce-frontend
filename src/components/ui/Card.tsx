import { type ReactNode } from "react";

export default function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl bg-white p-6 shadow-sm">{children}</div>;
}