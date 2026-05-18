import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";
import type { Category, Product, ProductPageResponse, CategoryListResponse } from "../../types/product";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [totalPages, setTotalPages] = useState(0);

  const query = useMemo(() => {
    if (keyword.trim()) return "search";
    if (selectedCategoryId) return "category";
    return "active";
  }, [keyword, selectedCategoryId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await api.get<CategoryListResponse>("/categories");
        setCategories(response.data.data);
      } catch {
        setCategories([]);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        if (keyword.trim()) {
          response = await api.get<ProductPageResponse>("/products/search", {
            params: { keyword, page, size, sort: "id,desc" },
          });
        } else if (selectedCategoryId) {
          response = await api.get<ProductPageResponse>(
            `/products/category/${selectedCategoryId}`,
            {
              params: { page, size, sort: "id,desc" },
            }
          );
        } else {
          response = await api.get<ProductPageResponse>("/products/active", {
            params: { page, size, sort: "id,desc" },
          });
        }

        setProducts(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, selectedCategoryId, page, size]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    setKeyword("");
    setPage(0);
  };

  const handleClearFilters = () => {
    setKeyword("");
    setSelectedCategoryId("");
    setPage(0);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Products
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Browse products, search by name, or filter by category.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full gap-3 md:max-w-xl">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
          />
          <button
            type="submit"
            className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedCategoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
            disabled={categoryLoading}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleClearFilters}
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Clear filters
          </button>
        </div>

        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : `${products.length} products shown`}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: size }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-3xl bg-white p-4 shadow-sm">
              <div className="mb-4 h-40 rounded-2xl bg-gray-200" />
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-10 rounded-2xl bg-gray-200" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
              <div className="p-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                  {product.categoryName}
                </p>
                <h3 className="mt-2 line-clamp-1 text-lg font-semibold text-black">
                  {product.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {product.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-black">
                    ₹{product.price}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      product.stock > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock > 0 ? `Stock: ${product.stock}` : "Out of stock"}
                  </span>
                </div>

                <Link
                  to={`/products/${product.id}`}
                  className="mt-4 block rounded-2xl bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-center gap-3">
        <button
          disabled={page === 0}
          onClick={() => setPage((prev) => prev - 1)}
          className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-gray-600">
          Page {page + 1} of {Math.max(totalPages, 1)}
        </span>

        <button
          disabled={page >= totalPages - 1}
          onClick={() => setPage((prev) => prev + 1)}
          className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}