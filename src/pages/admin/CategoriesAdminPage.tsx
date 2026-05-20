import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import PageHeader from "../../components/ui/PageHeader";

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
      setError(err?.response?.data?.message || "Failed to load categories");
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await api.put<CategoryResponseWrapper>(`/categories/${editingId}`, formData);
      } else {
        await api.post<CategoryResponseWrapper>("/categories", formData);
      }

      resetForm();
      await fetchCategories();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save category");
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
      } else {
        await api.patch(`/categories/${category.id}/activate`);
      }

      await fetchCategories();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update category status");
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Create, update, activate, and deactivate categories."
        action={
          <Button variant="secondary" onClick={fetchCategories}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <h3 className="text-lg font-semibold text-black">
            {editingId ? "Edit category" : "Add category"}
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
                rows={4}
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
            <h3 className="text-lg font-semibold text-black">Category list</h3>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories found.</p>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-semibold text-black">
                          {category.name}
                        </h4>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            category.active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {category.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-600">
                        {category.description || "No description"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button variant="secondary" onClick={() => handleEdit(category)}>
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