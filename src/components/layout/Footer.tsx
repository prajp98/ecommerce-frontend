import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              className="text-xl font-bold tracking-tight text-black"
            >
              ShopNest
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6 text-gray-600">
              A simple, colourful shopping experience with smooth browsing,
              secure checkout, and easy order tracking.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              Quick links
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <Link
                to="/products"
                className="block text-gray-600 transition hover:text-black"
              >
                Products
              </Link>
              <Link
                to="/cart"
                className="block text-gray-600 transition hover:text-black"
              >
                Cart
              </Link>
              <Link
                to="/orders"
                className="block text-gray-600 transition hover:text-black"
              >
                Orders
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              Support
            </h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <p>Fast checkout and simple returns.</p>
              <p>Need help? Keep support details here.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 ShopNest. All rights reserved.</p>
          <p>Built for a cleaner, brighter shopping flow.</p>
        </div>
      </div>
    </footer>
  );
}