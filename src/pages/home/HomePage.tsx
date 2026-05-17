import { Link } from "react-router";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 rounded-3xl bg-white p-8 shadow-sm md:grid-cols-2 md:p-12">
        <div className="flex flex-col justify-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Welcome to ShopNest
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
            Beautiful shopping experience with a clean, fast UI.
          </h1>
          <p className="mt-4 max-w-xl text-base text-gray-600">
            Browse products, manage your cart, save addresses, and place orders
            from a smooth ecommerce interface.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Shop now
            </Link>
            <Link
              to="/register"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl bg-gray-100 p-6">
            <div className="h-48 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
          </div>
        </div>
      </div>
    </section>
  );
}