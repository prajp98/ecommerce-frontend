import { useEffect, useState } from "react";
import { api } from "../../lib/api";

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-black">
          Categories
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Create, update, activate, and deactivate categories.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-black">
            {editingId ? "Edit category" : "Add category"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: Electronics"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
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
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">Category list</h3>
            <button
              onClick={fetchCategories}
              className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Refresh
            </button>
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
                      <button
                        onClick={() => handleEdit(category)}
                        className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleToggleActive(category)}
                        className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        {category.active ? "Deactivate" : "Activate"}
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