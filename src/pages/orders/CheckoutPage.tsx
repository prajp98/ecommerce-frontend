import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
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

      const cartData = cartResponse.data.data;
      const addressData = addressResponse.data.data;

      setCartItems(cartData);
      setAddresses(addressData);

      const defaultAddress = addressData.find((address) => address.defaultAddress);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressData.length > 0) {
        setSelectedAddressId(addressData[0].id);
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

      await api.post("/orders", {
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
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-32 animate-pulse rounded-3xl bg-gray-200" />
          <div className="h-32 animate-pulse rounded-3xl bg-gray-200" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <PageHeader
        title="Checkout"
        subtitle="Choose your address and place the order."
        action={
          <Link to="/cart">
            <Button variant="secondary">Back to cart</Button>
          </Link>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {success && (
        <div className="mb-6">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add products to your cart before checkout."
          action={
            <Link to="/products">
              <Button>Browse products</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-black">Shipping address</h2>

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
              <h2 className="text-lg font-semibold text-black">Payment method</h2>

              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4">
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
            </Card>
          </div>

          <Card>
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
              <div className="flex items-center justify-between border-t pt-3 text-base font-semibold text-black">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              onClick={handlePlaceOrder}
              disabled={placingOrder || addresses.length === 0}
            >
              {placingOrder ? "Placing order..." : "Place order"}
            </Button>

            <Link to="/cart" className="mt-3 block">
              <Button variant="secondary" className="w-full">
                Back to cart
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </section>
  );
}