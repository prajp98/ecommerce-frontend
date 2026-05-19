import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const handleLogout = () => {
    logout();
    setCartCount(0);
    setMobileOpen(false);
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-black ${
      isActive ? "text-black" : "text-gray-600"
    }`;

  const closeMobileMenu = () => setMobileOpen(false);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!isAuthenticated) {
        setCartCount(0);
        return;
      }

      try {
        const response = await api.get("/cart/me");
        const items = response.data.data || [];

        const count = items.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );

        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    fetchCartCount();
  }, [isAuthenticated]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-black">
          ShopNest
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            Cart
            {cartCount > 0 && (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs text-white">
                {cartCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/orders" className={linkClass}>
            Orders
          </NavLink>
          <NavLink to="/addresses" className={linkClass}>
            Addresses
          </NavLink>
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 rounded-full border border-gray-200 px-4 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-black">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 md:hidden"
        >
          Menu
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            <NavLink to="/" onClick={closeMobileMenu} className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/products" onClick={closeMobileMenu} className={linkClass}>
              Products
            </NavLink>
            <NavLink to="/cart" onClick={closeMobileMenu} className={linkClass}>
              Cart
              {cartCount > 0 && (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/orders" onClick={closeMobileMenu} className={linkClass}>
              Orders
            </NavLink>
            <NavLink to="/addresses" onClick={closeMobileMenu} className={linkClass}>
              Addresses
            </NavLink>
            {user?.role === "ADMIN" && (
              <NavLink to="/admin" onClick={closeMobileMenu} className={linkClass}>
                Admin
              </NavLink>
            )}

            <div className="mt-3 border-t pt-3">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex-1 rounded-2xl border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex-1 rounded-2xl bg-black px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}