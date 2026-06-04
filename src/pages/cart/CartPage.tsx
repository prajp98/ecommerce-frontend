import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

type CartItem = {
  cartItemId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  productImageUrl?: string | null;
  categoryName?: string;
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
  const { showToast } = useToast();

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
      setItems(response.data.data || []);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load cart";
      setError(message);
      showToast(message, "error");
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
      showToast("Cart updated successfully", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update item";
      setError(message);
      showToast(message, "error");
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
      showToast("Item removed from cart", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to remove item";
      setError(message);
      showToast(message, "error");
    } finally {
      setRemovingItemId(null);
    }
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-white via-pink-50/30 to-blue-50/40">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="space-y-4">
            <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-4">
                <div className="h-36 animate-pulse rounded-3xl bg-gray-200" />
                <div className="h-36 animate-pulse rounded-3xl bg-gray-200" />
              </div>
              <div className="h-56 animate-pulse rounded-3xl bg-gray-200" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-white via-pink-50/30 to-blue-50/40">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <PageHeader
          title="Cart"
          subtitle="Review your selected items before checkout."
          action={
            <Link to="/products">
              <Button variant="secondary">Continue shopping</Button>
            </Link>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-gray-500">Items</p>
            <p className="mt-2 text-2xl font-bold text-black">{items.length}</p>
            <p className="mt-1 text-sm text-gray-500">Products in cart</p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-500">Subtotal</p>
            <p className="mt-2 text-2xl font-bold text-black">₹{subtotal}</p>
            <p className="mt-1 text-sm text-gray-500">Before shipping</p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-500">Checkout</p>
            <p className="mt-2 text-2xl font-bold text-black">Ready</p>
            <p className="mt-1 text-sm text-gray-500">Proceed when you are set</p>
          </Card>
        </div>

        {error && (
          <div className="mt-6">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Your cart is empty"
              description="Add a few products and they will appear here with a nice summary."
              action={
                <Link to="/products">
                  <Button>Browse products</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.cartItemId}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-pink-100 via-white to-blue-100">
                        {item.productImageUrl ? (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-400">
                            No image
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-black">
                            {item.productName}
                          </h2>
                          {item.categoryName && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                              {item.categoryName}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          ₹{item.price} each
                        </p>

                        <p className="mt-1 text-sm font-medium text-black">
                          Total: ₹{item.totalPrice}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.cartItemId, item.quantity - 1)
                          }
                          disabled={updatingItemId === item.cartItemId}
                          className="cursor-pointer h-11 w-11 rounded-2xl border border-gray-300 bg-white text-lg font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          −
                        </button>

                        <div className="flex h-11 min-w-14 items-center justify-center rounded-2xl border border-gray-300 bg-white px-4 text-sm font-semibold text-black">
                          {item.quantity}
                        </div>

                        <button
                          onClick={() =>
                            handleQuantityChange(item.cartItemId, item.quantity + 1)
                          }
                          disabled={updatingItemId === item.cartItemId}
                          className="cursor-pointer h-11 w-11 rounded-2xl border border-gray-300 bg-white text-lg font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.cartItemId)}
                        disabled={removingItemId === item.cartItemId}
                        className="cursor-pointer text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {removingItemId === item.cartItemId
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card>
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-500">Order summary</p>
                  <h3 className="mt-1 text-2xl font-bold text-black">Your order</h3>
                </div>

                <div className="space-y-3 rounded-3xl bg-gradient-to-r from-pink-50 via-white to-blue-50 p-5">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Items</span>
                    <span>{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-base font-semibold text-black">Total</span>
                    <span className="text-lg font-bold text-black">₹{subtotal}</span>
                  </div>
                </div>

                <Link to="/checkout" className="block">
                  <Button className="w-full">Proceed to checkout</Button>
                </Link>

                <Link to="/products" className="block">
                  <Button variant="secondary" className="w-full">
                    Continue shopping
                  </Button>
                </Link>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                  Secure checkout, easy address selection, and a clear order summary.
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}