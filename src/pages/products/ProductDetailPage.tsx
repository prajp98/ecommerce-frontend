import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
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

type CartAddResponse = {
  timestamp: string;
  status: number;
  message: string;
  data: unknown;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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

      setSuccess("Added to cart successfully");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-3xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error || "Product not found"}
        </div>
        <div className="mt-6">
          <Link to="/products" className="text-sm font-medium text-black underline">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
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
          </div>

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
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock <= 0}
              className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addingToCart ? "Adding..." : "Add to cart"}
            </button>

            <Link
              to="/products"
              className="rounded-2xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Back to products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}