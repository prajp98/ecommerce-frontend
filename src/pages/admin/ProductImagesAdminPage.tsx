import { useEffect, useState } from "react";
import { api } from "../../lib/api";

type Product = {
  id: number;
  name: string;
  active: boolean;
};

type ProductImage = {
  id: number;
  imageUrl: string;
  primaryImage: boolean;
  productId: number;
};

type ProductListResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Product[];
};

type ProductImageListResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: ProductImage[];
};

type ProductImageResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: ProductImage;
};

export default function ProductImagesAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    imageUrl: "",
    primaryImage: false,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<ProductListResponseWrapper>("/products");
      setProducts(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async (productId: number) => {
    try {
      setLoadingImages(true);
      setError("");

      const response = await api.get<ProductImageListResponseWrapper>(
        `/products/${productId}/images`
      );
      setImages(response.data.data);
    } catch (err: any) {
      setImages([]);
      setError(err?.response?.data?.message || "Failed to load images");
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchImages(Number(selectedProductId));
    } else {
      setImages([]);
    }
  }, [selectedProductId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedProductId) {
      setError("Please select a product");
      return;
    }

    if (!formData.imageUrl.trim()) {
      setError("Image URL is required");
      return;
    }

    try {
      setSaving(true);

      await api.post<ProductImageResponseWrapper>(
        `/products/${selectedProductId}/images`,
        {
          imageUrl: formData.imageUrl.trim(),
          primaryImage: formData.primaryImage,
        }
      );

      setFormData({
        imageUrl: "",
        primaryImage: false,
      });

      await fetchImages(Number(selectedProductId));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add image");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    try {
      setDeletingId(imageId);
      setError("");

      await api.delete(`/products/images/${imageId}`);
      if (selectedProductId) {
        await fetchImages(Number(selectedProductId));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-black">
          Product Images
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Add and manage images for each product.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-black">Add image</h3>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.active ? "" : "(Inactive)"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="primaryImage"
                checked={formData.primaryImage}
                onChange={handleChange}
              />
              Set as primary image
            </label>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add image"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">Image list</h3>
            <button
              onClick={() =>
                selectedProductId && fetchImages(Number(selectedProductId))
              }
              className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Refresh
            </button>
          </div>

          {!selectedProductId ? (
            <p className="text-sm text-gray-500">
              Select a product to view its images.
            </p>
          ) : loadingImages ? (
            <p className="text-sm text-gray-500">Loading images...</p>
          ) : images.length === 0 ? (
            <p className="text-sm text-gray-500">No images found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.imageUrl}
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      {image.primaryImage ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Primary
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          Secondary
                        </span>
                      )}

                      <button
                        onClick={() => handleDelete(image.id)}
                        disabled={deletingId === image.id}
                        className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-60"
                      >
                        {deletingId === image.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}