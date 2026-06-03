import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
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
  description: string;
  active: boolean;
};

type CategoryResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Category;
};

type CategoryListResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Category[];
};

export default function CategoriesAdminPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<CategoryListResponseWrapper>("/categories");
      setCategories(response.data.data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to load categories";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      const message = "Category name is required";
      setError(message);
      showToast(message, "error");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await api.put<CategoryResponseWrapper>(
          `/categories/${editingId}`,
          formData
        );
        showToast("Category updated successfully", "success");
      } else {
        await api.post<CategoryResponseWrapper>("/categories", formData);
        showToast("Category created successfully", "success");
      }

      resetForm();
      await fetchCategories();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save category";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (category: Category) => {
    try {
      setError("");

      if (category.active) {
        await api.patch(`/categories/${category.id}/deactivate`);
        showToast("Category deactivated successfully", "success");
      } else {
        await api.patch(`/categories/${category.id}/activate`);
        showToast("Category activated successfully", "success");
      }

      await fetchCategories();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Failed to update category status";
      setError(message);
      showToast(message, "error");
    }
  };

  const activeCount = categories.filter((category) => category.active).length;
  const inactiveCount = categories.length - activeCount;

  return (
    <div className="bg-gradient-to-b from-white via-pink-50/30 to-blue-50/40">
      <PageHeader
        title="Categories"
        subtitle="Create, update, activate, and deactivate categories."
        action={
          <Button variant="secondary" onClick={fetchCategories}>
            Refresh
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-black">{categories.length}</p>
          <p className="mt-1 text-sm text-gray-500">Categories in catalog</p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">Active</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="mt-1 text-sm text-gray-500">Ready for products</p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">Inactive</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{inactiveCount}</p>
          <p className="mt-1 text-sm text-gray-500">Hidden from users</p>
        </Card>
      </div>

      {error && (
        <div className="mb-6 mt-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-black">
              {editingId ? "Edit category" : "Add category"}
            </h3>
            <p className="text-sm text-gray-500">
              Keep the category names short and clear for better browsing.
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
                placeholder="Example: Electronics"
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
                placeholder="Category description"
                rows={5}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
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
            <div>
              <h3 className="text-lg font-semibold text-black">Category list</h3>
              <p className="text-sm text-gray-500">
                Manage visibility and update details here.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl border border-gray-200 p-4">
                  <div className="h-5 w-40 rounded bg-gray-200" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
                  <div className="mt-4 flex gap-3">
                    <div className="h-10 w-24 rounded-2xl bg-gray-200" />
                    <div className="h-10 w-28 rounded-2xl bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-500">No categories found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-base font-semibold text-black">
                          {category.name}
                        </h4>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            category.active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {category.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {category.description || "No description"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(category)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => handleToggleActive(category)}
                      >
                        {category.active ? "Deactivate" : "Activate"}
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