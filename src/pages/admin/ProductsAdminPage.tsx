import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";
import { useToast } from "../../components/ui/Toast";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  active: boolean;
  primaryImageUrl?: string | null;
};

type ProductResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Product;
};

type ProductListResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Product[];
};

type CategoryListResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Category[];
};

export default function ProductsAdminPage() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get<ProductListResponseWrapper>("/products"),
        api.get<CategoryListResponseWrapper>("/categories"),
      ]);

      setProducts(productsResponse.data.data);
      setCategories(categoriesResponse.data.data);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load products";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
    });
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name.trim() ||
      !formData.price.trim() ||
      !formData.stock.trim() ||
      !formData.categoryId.trim()
    ) {
      const message = "Please fill all required fields";
      setError(message);
      showToast(message, "error");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      categoryId: Number(formData.categoryId),
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put<ProductResponseWrapper>(`/products/${editingId}`, payload);
        showToast("Product updated successfully", "success");
      } else {
        await api.post<ProductResponseWrapper>("/products", payload);
        showToast("Product created successfully", "success");
      }

      resetForm();
      await fetchData();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save product";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      categoryId: String(product.categoryId),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (product: Product) => {
    try {
      setError("");

      if (product.active) {
        await api.patch(`/products/${product.id}/deactivate`);
        showToast("Product deactivated successfully", "success");
      } else {
        await api.patch(`/products/${product.id}/activate`);
        showToast("Product activated successfully", "success");
      }

      await fetchData();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to update product status";
      setError(message);
      showToast(message, "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Create, update, activate, and deactivate products."
        action={
          <Button variant="secondary" onClick={fetchData}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <h3 className="text-lg font-semibold text-black">
            {editingId ? "Edit product" : "Add product"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: iPhone 15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description"
                rows={4}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Price
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="49999"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Product images are managed separately in the Product Images section.
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>

              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">Product list</h3>

            <Link to="/admin/images">
              <Button variant="secondary">Manage images</Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-500">No products found.</p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                        {product.primaryImageUrl ? (
                          <img
                            src={product.primaryImageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-base font-semibold text-black">
                            {product.name}
                          </h4>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              product.active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-600">
                          {product.description || "No description"}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                          Category: {product.categoryName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Price: ₹{product.price} | Stock: {product.stock}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => handleToggleActive(product)}
                      >
                        {product.active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}