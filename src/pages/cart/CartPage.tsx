import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import { useToast } from "../../components/ui/Toast";

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
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-40 animate-pulse rounded-3xl bg-gray-200" />
          <div className="h-40 animate-pulse rounded-3xl bg-gray-200" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <PageHeader
        title="Cart"
        subtitle="Review your items before checkout."
        action={
          <Button variant="secondary" onClick={fetchCart}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add products to your cart to continue shopping."
          action={
            <Link to="/products">
              <Button>Continue shopping</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.cartItemId}>
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
                      disabled={updatingItemId === item.cartItemId}
                      className="cursor-pointer h-10 w-10 rounded-full border border-gray-300 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
                      disabled={updatingItemId === item.cartItemId}
                      className="cursor-pointer h-10 w-10 rounded-full border border-gray-300 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="cursor-pointer text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removingItemId === item.cartItemId
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <Card>
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

            <Link to="/checkout" className="mt-6 block">
              <Button className="w-full">Proceed to checkout</Button>
            </Link>

            <Link to="/products" className="mt-3 block">
              <Button variant="secondary" className="w-full">
                Continue shopping
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </section>
  );
}