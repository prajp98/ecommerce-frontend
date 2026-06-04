import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import { useToast } from "../../components/ui/Toast";
import type { OrderResponseWrapper } from "../../types/order";

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

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [cartItems]
  );

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");

      const [cartResponse, addressResponse] = await Promise.all([
        api.get<CartResponseWrapper>("/cart/me"),
        api.get<AddressResponseWrapper>("/addresses/me"),
      ]);

      const cartData = cartResponse.data.data;
      const addressData = addressResponse.data.data;

      setCartItems(cartData);
      setAddresses(addressData);

      const defaultAddress = addressData.find(
        (address) => address.defaultAddress
      );

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressData.length > 0) {
        setSelectedAddressId(addressData[0].id);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to load checkout data";
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

    fetchCheckoutData();
  }, [isAuthenticated, navigate]);

  const handlePlaceOrder = async () => {
    setError("");

    if (!selectedAddressId) {
      const message = "Please select an address";
      setError(message);
      showToast(message, "error");
      return;
    }

    if (cartItems.length === 0) {
      const message = "Your cart is empty";
      setError(message);
      showToast(message, "error");
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await api.post<OrderResponseWrapper>("/orders", {
        addressId: selectedAddressId,
        paymentMethod,
      });

      const createdOrder = response.data.data;

      showToast("Order placed successfully", "success");

      setTimeout(() => {
        navigate(`/order-success/${createdOrder.orderId}`, {
          state: {
            orderNumber: createdOrder.orderNumber,
            totalAmount: createdOrder.totalAmount,
            paymentMethod,
          },
        });
      }, 700);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to place order";
      setError(message);
      showToast(message, "error");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-white via-pink-50/30 to-blue-50/40">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="space-y-4">
            <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <div className="h-32 animate-pulse rounded-3xl bg-gray-200" />
                <div className="h-32 animate-pulse rounded-3xl bg-gray-200" />
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
          title="Checkout"
          subtitle="Choose your address, review your order, and place it in one smooth step."
          action={
            <Link to="/cart">
              <Button variant="secondary">Back to cart</Button>
            </Link>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-gray-500">Step 1</p>
            <p className="mt-2 text-lg font-bold text-black">Address</p>
            <p className="mt-1 text-sm text-gray-500">
              Select where your order should go
            </p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-500">Step 2</p>
            <p className="mt-2 text-lg font-bold text-black">Payment</p>
            <p className="mt-1 text-sm text-gray-500">
              Choose COD or UPI with ease
            </p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-500">Step 3</p>
            <p className="mt-2 text-lg font-bold text-black">Confirm</p>
            <p className="mt-1 text-sm text-gray-500">
              Place your order and track it later
            </p>
          </Card>
        </div>

        {error && (
          <div className="mt-6">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Your cart is empty"
              description="Add products to your cart before checkout."
              action={
                <Link to="/products">
                  <Button>Browse products</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-black">
                      Shipping address
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose a saved address or add a new one.
                    </p>
                  </div>

                  <Link to="/addresses">
                    <Button variant="secondary">Manage addresses</Button>
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="mt-4">
                    <Alert variant="info">
                      No addresses found. Please add one first.
                    </Alert>
                    <div className="mt-4">
                      <Link to="/addresses">
                        <Button>Add address</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-3xl border p-4 transition ${
                          selectedAddressId === address.id
                            ? "border-black bg-white shadow-sm"
                            : "border-gray-200 bg-white/70"
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
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-black">
                              {address.line1}
                            </p>
                            {address.defaultAddress && (
                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {address.line2 && `${address.line2}, `}
                            {address.city}, {address.state} - {address.zipCode},{" "}
                            {address.country}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-black">
                  Payment method
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Select the payment option that works best for you.
                </p>

                <div className="mt-4 space-y-3">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-3xl border p-4 transition ${
                      paymentMethod === "COD"
                        ? "border-black bg-white shadow-sm"
                        : "border-gray-200 bg-white/70"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />
                    <span className="text-sm font-medium text-black">
                      Cash on Delivery
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-3xl border p-4 transition ${
                      paymentMethod === "UPI"
                        ? "border-black bg-white shadow-sm"
                        : "border-gray-200 bg-white/70"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "UPI"}
                      onChange={() => setPaymentMethod("UPI")}
                    />
                    <span className="text-sm font-medium text-black">UPI</span>
                  </label>
                </div>
              </Card>
            </div>

            <Card>
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Order summary
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-black">
                    Review order
                  </h2>
                </div>

                <div className="space-y-3 rounded-3xl bg-gradient-to-r from-pink-50 via-white to-blue-50 p-5">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Items</span>
                    <span>{cartItems.length}</span>
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
                    <span className="text-base font-semibold text-black">
                      Total
                    </span>
                    <span className="text-lg font-bold text-black">
                      ₹{subtotal}
                    </span>
                  </div>
                </div>

                {selectedAddress && (
                  <div className="rounded-3xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                    <p className="font-medium text-black">Delivering to</p>
                    <p className="mt-1 leading-6">
                      {selectedAddress.line1}
                      {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""},{" "}
                      {selectedAddress.city}, {selectedAddress.state} -{" "}
                      {selectedAddress.zipCode}, {selectedAddress.country}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || addresses.length === 0}
                >
                  {placingOrder ? "Placing order..." : "Place order"}
                </Button>

                <Link to="/cart" className="block">
                  <Button variant="secondary" className="w-full">
                    Back to cart
                  </Button>
                </Link>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600">
                  Secure checkout with a clear summary before payment.
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}