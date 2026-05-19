import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

type CartItem = {
  cartItemId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
};

type CartResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: CartItem[];
};

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCart();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<CartResponseWrapper>("/cart/me");
      setItems(response.data.data);
      await refreshCartCount();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchCart();
  }, [isAuthenticated, navigate]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items]
  );

  const handleQuantityChange = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;

    try {
      setUpdatingItemId(cartItemId);
      setError("");

      await api.put(`/cart/items/${cartItemId}`, { quantity });
      await fetchCart();
      await refreshCartCount();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (cartItemId: number) => {
    try {
      setRemovingItemId(cartItemId);
      setError("");

      await api.delete(`/cart/items/${cartItemId}`);
      await fetchCart();
      await refreshCartCount();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to remove item");
    } finally {
      setRemovingItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-40 animate-pulse rounded-3xl bg-gray-200" />
          <div className="h-40 animate-pulse rounded-3xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Cart</h1>
          <p className="mt-2 text-sm text-gray-500">
            Review your items before checkout.
          </p>
        </div>

        <button
          onClick={fetchCart}
          className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link
            to="/products"
            className="mt-5 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.cartItemId}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-black">
                      {item.productName}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      ₹{item.price} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.cartItemId, item.quantity - 1)
                      }
                      className="h-10 w-10 rounded-full border border-gray-300 text-lg font-semibold"
                      disabled={updatingItemId === item.cartItemId}
                    >
                      −
                    </button>

                    <span className="min-w-10 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        handleQuantityChange(item.cartItemId, item.quantity + 1)
                      }
                      className="h-10 w-10 rounded-full border border-gray-300 text-lg font-semibold"
                      disabled={updatingItemId === item.cartItemId}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Total: ₹{item.totalPrice}
                  </span>

                  <button
                    onClick={() => handleRemove(item.cartItemId)}
                    disabled={removingItemId === item.cartItemId}
                    className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-60"
                  >
                    {removingItemId === item.cartItemId
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-black">Order summary</h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-6 inline-flex w-full justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Proceed to checkout
            </Link>

            <Link
              to="/products"
              className="mt-3 inline-flex w-full justify-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}