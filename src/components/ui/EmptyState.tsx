import { type ReactNode } from "react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 via-white to-blue-100">
        <span className="text-lg font-bold text-black">!</span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>

      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}