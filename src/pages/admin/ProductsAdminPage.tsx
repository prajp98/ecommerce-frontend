import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
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
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
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

  const activeCount = products.filter((product) => product.active).length;
  const inactiveCount = products.length - activeCount;

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === formData.categoryId),
    [categories, formData.categoryId]
  );

  return (
    <div className="bg-gradient-to-b from-white via-pink-50/30 to-blue-50/40">
      <PageHeader
        title="Products"
        subtitle="Create, update, activate, and deactivate products."
        action={
          <div className="flex gap-3">
            <Link to="/admin/images">
              <Button variant="secondary">Manage images</Button>
            </Link>
            <Button variant="secondary" onClick={fetchData}>
              Refresh
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-black">{products.length}</p>
          <p className="mt-1 text-sm text-gray-500">Products in catalog</p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">Active</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="mt-1 text-sm text-gray-500">Visible to shoppers</p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">Inactive</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{inactiveCount}</p>
          <p className="mt-1 text-sm text-gray-500">Hidden from storefront</p>
        </Card>
      </div>

      {error && (
        <div className="mb-6 mt-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-black">
              {editingId ? "Edit product" : "Add product"}
            </h3>
            <p className="text-sm text-gray-500">
              Keep product names short, clear, and easy to scan.
            </p>
          </div>

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
                placeholder="Example: Wireless Headphones"
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
                rows={5}
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
                  placeholder="4999"
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
                className="cursor-pointer w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Selected category: <span className="font-semibold">{selectedCategory.name}</span>
              </div>
            )}

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
            <div>
              <h3 className="text-lg font-semibold text-black">Product list</h3>
              <p className="text-sm text-gray-500">
                Edit visibility and keep the catalog fresh.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-3xl border border-gray-200 p-5"
                >
                  <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-3xl bg-gray-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-48 rounded bg-gray-200" />
                      <div className="h-4 w-2/3 rounded bg-gray-200" />
                      <div className="h-4 w-1/3 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <div className="h-10 w-24 rounded-2xl bg-gray-200" />
                    <div className="h-10 w-28 rounded-2xl bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-500">No products found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-pink-100 via-white to-blue-100">
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
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {product.active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
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