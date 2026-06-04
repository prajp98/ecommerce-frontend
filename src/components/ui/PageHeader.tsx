import { type ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}