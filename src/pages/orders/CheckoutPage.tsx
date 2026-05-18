import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type CartItem = {
  cartItemId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
};

type Address = {
  id: number;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  defaultAddress: boolean;
  userId: number;
};

type CartResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: CartItem[];
};

type AddressResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Address[];
};

type OrderResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: unknown;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [cartItems]
  );

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");

      const [cartResponse, addressResponse] = await Promise.all([
        api.get<CartResponseWrapper>("/cart/me"),
        api.get<AddressResponseWrapper>("/addresses/me"),
      ]);

      setCartItems(cartResponse.data.data);
      setAddresses(addressResponse.data.data);

      const defaultAddress = addressResponse.data.data.find(
        (address) => address.defaultAddress
      );

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressResponse.data.data.length > 0) {
        setSelectedAddressId(addressResponse.data.data[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchCheckoutData();
  }, [isAuthenticated, navigate]);

  const handlePlaceOrder = async () => {
    setError("");
    setSuccess("");

    if (!selectedAddressId) {
      setError("Please select an address");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await api.post<OrderResponseWrapper>("/orders", {
        addressId: selectedAddressId,
        paymentMethod,
      });

      setSuccess("Order placed successfully");

      setTimeout(() => {
        navigate("/orders");
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-32 animate-pulse rounded-3xl bg-gray-200" />
          <div className="h-32 animate-pulse rounded-3xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-black">Checkout</h1>
        <p className="mt-2 text-sm text-gray-500">
          Choose your address and place the order.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link
            to="/products"
            className="mt-5 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-black">Shipping address</h2>

              {addresses.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  No addresses found. Please add one first.
                  <div className="mt-3">
                    <Link
                      to="/addresses"
                      className="inline-flex rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                      Add address
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                        selectedAddressId === address.id
                          ? "border-black bg-gray-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-black">{address.line1}</p>
                          {address.defaultAddress && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {address.line2 && `${address.line2}, `}
                          {address.city}, {address.state} - {address.zipCode}, {address.country}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-black">Payment method</h2>

              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <span className="text-sm font-medium text-black">Cash on Delivery</span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                  />
                  <span className="text-sm font-medium text-black">UPI</span>
                </label>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Order summary</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Items</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Shipping</span>
                <span>₹0</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between text-base font-semibold text-black">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || addresses.length === 0}
              className="mt-6 w-full rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingOrder ? "Placing order..." : "Place order"}
            </button>

            <Link
              to="/cart"
              className="mt-3 inline-flex w-full justify-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Back to cart
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}