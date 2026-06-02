import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";
import type {
  Product,
  ProductImage,
  ProductImageListResponse,
} from "../../types/product";

type ProductResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Product;
};

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

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCart();
  const { showToast } = useToast();

  const productId = useMemo(() => Number(id), [id]);

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");

  const [cartItemId, setCartItemId] = useState<number | null>(null);
  const [cartQuantity, setCartQuantity] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [error, setError] = useState("");

  const primaryImageUrl = useMemo(() => {
    if (selectedImageUrl) return selectedImageUrl;
    const primary = images.find((img) => img.primaryImage);
    return primary?.imageUrl || images[0]?.imageUrl || "";
  }, [images, selectedImageUrl]);

  const fetchCartItemForProduct = async () => {
    if (!isAuthenticated || Number.isNaN(productId)) {
      setCartItemId(null);
      setCartQuantity(0);
      return;
    }

    try {
      setCartLoading(true);

      const response = await api.get<CartResponseWrapper>("/cart/me");
      const items = response.data.data || [];
      const matchingItem = items.find((item) => item.productId === productId);

      setCartItemId(matchingItem ? matchingItem.cartItemId : null);
      setCartQuantity(matchingItem ? matchingItem.quantity : 0);
    } catch {
      setCartItemId(null);
      setCartQuantity(0);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (Number.isNaN(productId)) return;

      try {
        setLoading(true);
        setError("");

        const [productResponse, imageResponse] = await Promise.all([
          api.get<ProductResponseWrapper>(`/products/${productId}`),
          api.get<ProductImageListResponse>(`/products/${productId}/images`),
        ]);

        const productData = productResponse.data.data;
        const imageData = imageResponse.data.data;

        setProduct(productData);
        setImages(imageData);

        const primary = imageData.find((img) => img.primaryImage);
        setSelectedImageUrl(primary?.imageUrl || imageData[0]?.imageUrl || "");
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    fetchCartItemForProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, productId]);

  const handleIncrease = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setUpdatingCart(true);
      setError("");

      await api.post("/cart/items", {
        productId,
        quantity: 1,
      });

      await refreshCartCount();
      await fetchCartItemForProduct();
      showToast("Added to cart", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update cart", "error");
    } finally {
      setUpdatingCart(false);
    }
  };

  const handleDecrease = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!cartItemId) return;

    try {
      setUpdatingCart(true);
      setError("");

      if (cartQuantity <= 1) {
        await api.delete(`/cart/items/${cartItemId}`);
      } else {
        await api.put(`/cart/items/${cartItemId}`, {
          quantity: cartQuantity - 1,
        });
      }

      await refreshCartCount();
      await fetchCartItemForProduct();
      showToast("Cart updated", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update cart", "error");
    } finally {
      setUpdatingCart(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-3xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <Alert variant="error">{error || "Product not found"}</Alert>

        <div className="mt-6">
          <Link
            to="/products"
            className="text-sm font-medium text-black underline"
          >
            Back to products
          </Link>
        </div>
      </section>
    );
  }

  const qty = cartQuantity;
  const inStock = product.stock > 0;

  return (
    <section className="bg-gradient-to-b from-white via-pink-50/30 to-blue-50/40">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <PageHeader
          title={product.name}
          subtitle={product.categoryName}
          action={
            <Link to="/products">
              <Button variant="secondary">Back to products</Button>
            </Link>
          }
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Card>
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="aspect-square">
                  {primaryImageUrl ? (
                    <img
                      src={primaryImageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100 text-sm font-medium text-gray-400">
                      No image available
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageUrl(image.imageUrl)}
                    className={`cursor-pointer h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border transition ${
                      selectedImageUrl === image.imageUrl
                        ? "border-black"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt="Product thumbnail"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {product.categoryName}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      inStock
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {inStock ? `In stock: ${product.stock}` : "Out of stock"}
                  </span>
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
                    {product.name}
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-end justify-between rounded-3xl bg-gradient-to-r from-pink-50 via-white to-blue-50 p-5">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="mt-1 text-3xl font-bold text-black">
                      ₹{product.price}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className="mt-1 text-sm font-semibold text-black">
                      {inStock ? "Ready to ship" : "Currently unavailable"}
                    </p>
                  </div>
                </div>

                {error && (
                  <Alert variant="error">{error}</Alert>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDecrease}
                    disabled={cartLoading || updatingCart || qty === 0}
                    className="cursor-pointer h-12 w-12 rounded-2xl border border-gray-300 text-lg font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    −
                  </button>

                  <div className="flex h-12 min-w-16 items-center justify-center rounded-2xl border border-gray-300 bg-white px-4 text-sm font-semibold text-black">
                    {cartLoading ? "..." : qty}
                  </div>

                  <button
                    onClick={handleIncrease}
                    disabled={updatingCart || !inStock}
                    className="cursor-pointer h-12 rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingCart ? "Updating..." : qty > 0 ? "Add one more" : "Add to cart"}
                  </button>

                  <Link to="/cart">
                    <Button variant="secondary">Go to cart</Button>
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="text-sm font-medium text-black">Secure checkout</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Safe and simple checkout flow.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="text-sm font-medium text-black">Fast support</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Easy order tracking and status updates.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="text-sm font-medium text-black">Easy returns</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Clear order details and item history.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}