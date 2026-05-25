import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";
import ProductImage from "../../components/product/ProductImage";
import { useToast } from "../../components/ui/Toast";
import type {
  Product,
  ProductImage as ProductImageType,
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

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImageType[]>([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string>("");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [cartItemId, setCartItemId] = useState<number | null>(null);
  const [cartQuantity, setCartQuantity] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [error, setError] = useState("");

  const productId = useMemo(() => Number(id), [id]);

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

        const resolvedPrimaryImage =
          productData.primaryImageUrl ||
          imageData.find((img) => img.primaryImage)?.imageUrl ||
          imageData[0]?.imageUrl ||
          "";

        setPrimaryImageUrl(resolvedPrimaryImage);
        setSelectedImageUrl(resolvedPrimaryImage);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(productId)) {
      fetchProduct();
    }
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
      setAddingToCart(true);
      setError("");

      await api.post("/cart/items", {
        productId,
        quantity: 1,
      });

      await refreshCartCount();
      await fetchCartItemForProduct();
      showToast("Cart updated successfully", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update cart", "error");
    } finally {
      setAddingToCart(false);
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
      showToast("Cart updated successfully", "success");
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
          <Link to="/products" className="text-sm font-medium text-black underline">
            Back to products
          </Link>
        </div>
      </section>
    );
  }

  const currentQuantity = cartQuantity;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <PageHeader
        title={product.name}
        subtitle={product.categoryName}
        action={
          <Link to="/products" className="text-sm font-medium text-black underline">
            Back to products
          </Link>
        }
      />

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <Card>
            <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
              <ProductImage
                src={selectedImageUrl || primaryImageUrl}
                alt={product.name}
                fallbackText="No image available"
              />
            </div>
          </Card>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
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

        <div className="flex flex-col justify-center">
          <Card>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
              {product.categoryName}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-black">
              {product.name}
            </h1>

            <p className="mt-4 text-2xl font-bold text-black">₹{product.price}</p>

            <div className="mt-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  product.stock > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
              </span>
            </div>

            <p className="mt-6 text-base leading-7 text-gray-600">
              {product.description}
            </p>

            {error && (
              <div className="mt-6">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={handleDecrease}
                disabled={cartLoading || updatingCart || currentQuantity === 0}
                className="cursor-pointer h-11 w-11 rounded-2xl border border-gray-300 text-lg font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                −
              </button>

              <div className="flex h-11 min-w-14 items-center justify-center rounded-2xl border border-gray-300 px-4 text-sm font-semibold text-black">
                {cartLoading ? "..." : currentQuantity}
              </div>

              <button
                onClick={handleIncrease}
                disabled={addingToCart || updatingCart || product.stock <= 0}
                className="cursor-pointer h-11 w-11 rounded-2xl bg-black text-lg font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>

              <Link to="/cart">
                <Button variant="secondary">Go to cart</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}