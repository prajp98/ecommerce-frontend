import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
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

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const productId = useMemo(() => Number(id), [id]);

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

        const primaryImage = imageData.find((img) => img.primaryImage);
        setSelectedImageUrl(primaryImage?.imageUrl || imageData[0]?.imageUrl || "");
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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
      setSuccess("");
      setError("");

      await api.post("/cart/items", {
        productId,
        quantity: 1,
      });

      await refreshCartCount();
      setSuccess("Added to cart successfully");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
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

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <PageHeader
        title={product.name}
        subtitle={product.categoryName}
        action={
          <Link
            to="/products"
            className="text-sm font-medium text-black underline"
          >
            Back to products
          </Link>
        }
      />

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <Card>
            <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
              {selectedImageUrl ? (
                <img
                  src={selectedImageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No image available
                </div>
              )}
            </div>
          </Card>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageUrl(image.imageUrl)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border transition ${
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

            {success && (
              <div className="mt-6">
                <Alert variant="success">{success}</Alert>
              </div>
            )}

            {error && (
              <div className="mt-6">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock <= 0}
              >
                {addingToCart ? "Adding..." : "Add to cart"}
              </Button>

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