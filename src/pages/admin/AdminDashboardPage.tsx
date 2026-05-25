import { Link, NavLink, Outlet } from "react-router";

export default function AdminDashboardPage() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
      isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage catalog, images, and orders.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex cursor-pointer items-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Back to store
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Menu
          </h2>

          <nav className="mt-5 space-y-2">
            <NavLink to="/admin" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/categories" className={linkClass}>
              Categories
            </NavLink>
            <NavLink to="/admin/products" className={linkClass}>
              Products
            </NavLink>
            <NavLink to="/admin/images" className={linkClass}>
              Product Images
            </NavLink>
            <NavLink to="/admin/orders" className={linkClass}>
              Orders
            </NavLink>
          </nav>
        </aside>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </section>
  );
}