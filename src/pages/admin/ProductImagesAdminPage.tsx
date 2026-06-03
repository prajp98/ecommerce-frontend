import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import ProductImage from "../../components/product/ProductImage";
import { useToast } from "../../components/ui/Toast";

type Product = {
  id: number;
  name: string;
  active: boolean;
};

type ProductImageType = {
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
  data: ProductImageType[];
};

type ProductImageResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: ProductImageType;
};

export default function ProductImagesAdminPage() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [images, setImages] = useState<ProductImageType[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    file: null as File | null,
    primaryImage: false,
  });

  const [previewUrl, setPreviewUrl] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === selectedProductId),
    [products, selectedProductId]
  );

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setError("");

      const response = await api.get<ProductListResponseWrapper>("/products");
      setProducts(response.data.data);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load products";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoadingProducts(false);
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
      const message = err?.response?.data?.message || "Failed to load images";
      setImages([]);
      setError(message);
      showToast(message, "error");
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

  useEffect(() => {
    if (!formData.file) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(formData.file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [formData.file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedProductId) {
      const message = "Please select a product";
      setError(message);
      showToast(message, "error");
      return;
    }

    if (!formData.file) {
      const message = "Please choose an image file";
      setError(message);
      showToast(message, "error");
      return;
    }

    try {
      setSaving(true);

      const form = new FormData();
      form.append("file", formData.file);
      form.append("primaryImage", String(formData.primaryImage));

      await api.post<ProductImageResponseWrapper>(
        `/products/${selectedProductId}/images/upload`,
        form
      );

      setFormData({
        file: null,
        primaryImage: false,
      });
      setPreviewUrl("");

      await fetchImages(Number(selectedProductId));
      showToast("Image uploaded successfully", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to upload image";
      setError(message);
      showToast(message, "error");
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

      showToast("Image deleted successfully", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to delete image";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      setSettingPrimaryId(imageId);
      setError("");

      await api.patch(`/products/images/${imageId}/primary`);
      if (selectedProductId) {
        await fetchImages(Number(selectedProductId));
      }

      showToast("Primary image updated successfully", "success");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to set primary image";
      setError(message);
      showToast(message, "error");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white via-pink-50/30 to-blue-50/40">
      <PageHeader
        title="Product Images"
        subtitle="Upload, manage, and set primary images for each product."
        action={
          <Button variant="secondary" onClick={fetchProducts}>
            Refresh products
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Products</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {loadingProducts ? "..." : products.length}
          </p>
          <p className="mt-1 text-sm text-gray-500">Available in catalog</p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">Images</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {loadingImages ? "..." : images.length}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            For the selected product
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">Selection</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {selectedProduct ? selectedProduct.name : "None"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {selectedProduct?.active ? "Active product" : "Choose a product"}
          </p>
        </Card>
      </div>

      {error && (
        <div className="mb-6 mt-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-black">Upload image</h3>
            <p className="text-sm leading-6 text-gray-600">
              Select a product, choose an image file, and mark it as primary if
              needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="cursor-pointer w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                disabled={loadingProducts}
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
                Image file
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.primaryImage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    primaryImage: e.target.checked,
                  }))
                }
              />
              Set as primary image
            </label>

            {previewUrl && (
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="aspect-square">
                  <ProductImage
                    src={previewUrl}
                    alt="Preview"
                    fallbackText="Preview unavailable"
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Uploading..." : "Upload image"}
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-black">Image list</h3>
              <p className="text-sm text-gray-500">
                Manage the gallery for the selected product.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={() =>
                selectedProductId && fetchImages(Number(selectedProductId))
              }
            >
              Refresh images
            </Button>
          </div>

          {!selectedProductId ? (
            <EmptyState
              title="Select a product"
              description="Choose a product to view and manage its images."
            />
          ) : loadingImages ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <div className="animate-pulse">
                    <div className="h-56 rounded-3xl bg-gray-200" />
                    <div className="mt-4 h-4 w-24 rounded bg-gray-200" />
                    <div className="mt-3 h-10 rounded-2xl bg-gray-200" />
                  </div>
                </Card>
              ))}
            </div>
          ) : images.length === 0 ? (
            <EmptyState
              title="No images found"
              description="Upload the first image for this product."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((image) => (
                <Card key={image.id}>
                  <div className="overflow-hidden rounded-3xl bg-gray-100">
                    <div className="aspect-square">
                      <ProductImage
                        src={image.imageUrl}
                        alt="Product image"
                        fallbackText="Image unavailable"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    {image.primaryImage ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Primary
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        Secondary
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {!image.primaryImage && (
                      <Button
                        variant="secondary"
                        onClick={() => handleSetPrimary(image.id)}
                        disabled={settingPrimaryId === image.id}
                        className="cursor-pointer"
                      >
                        {settingPrimaryId === image.id
                          ? "Setting..."
                          : "Set primary"}
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      onClick={() => handleDelete(image.id)}
                      disabled={deletingId === image.id}
                      className="cursor-pointer"
                    >
                      {deletingId === image.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}