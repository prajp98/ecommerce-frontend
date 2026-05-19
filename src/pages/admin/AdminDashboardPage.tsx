import { Link, Outlet } from "react-router";

export default function AdminDashboardPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage catalog, orders, and store content.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Menu
          </h2>

          <nav className="mt-5 space-y-2">
            <Link
              to="/admin/categories"
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Categories
            </Link>
            <Link
              to="/admin/products"
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Products
            </Link>
            <Link
              to="/admin/orders"
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Orders
            </Link>
            <Link
              to="/admin/images"
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Product Images
            </Link>
          </nav>
        </aside>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </section>
  );
}