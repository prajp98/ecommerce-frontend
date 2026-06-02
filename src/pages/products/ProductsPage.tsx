import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

type Category = {
  id: number;
  name: string;
  description: string;
  active: boolean;
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

type ProductPageResponse = {
  timestamp: string;
  status: number;
  message: string;
  data: {
    content: Product[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  };
};

type CategoryListResponse = {
  timestamp: string;
  status: number;
  message: string;
  data: Category[];
};

const categoryStyles: Record<string, string> = {
  Electronics: "bg-blue-50 text-blue-700 border-blue-100",
  Fashion: "bg-pink-50 text-pink-700 border-pink-100",
  "Home & Kitchen": "bg-amber-50 text-amber-700 border-amber-100",
  Beauty: "bg-violet-50 text-violet-700 border-violet-100",
  Sports: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

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

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const activeFilterLabel = useMemo(() => {
    if (keyword.trim()) return `Search: "${keyword.trim()}"`;
    if (selectedCategory) return `Category: ${selectedCategory.name}`;
    return "All products";
  }, [keyword, selectedCategory]);

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
        setError(err?.response?.data?.message || "Failed to load products");
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
    <section className="bg-gradient-to-b from-white via-pink-50/30 to-blue-50/40">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <PageHeader
          title="Products"
          subtitle="Browse products, search by name, or filter by category."
          action={
            <form
              onSubmit={handleSearch}
              className="flex w-full gap-3 md:max-w-2xl"
            >
              <Input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products..."
                className="w-full"
              />
              <Button type="submit">Search</Button>
            </form>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-gray-500">Showing</p>
            <p className="mt-2 text-2xl font-bold text-black">
              {loading ? "..." : products.length}
            </p>
            <p className="mt-1 text-sm text-gray-500">{activeFilterLabel}</p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-500">Categories</p>
            <p className="mt-2 text-2xl font-bold text-black">
              {categoryLoading ? "..." : categories.filter((c) => c.active).length}
            </p>
            <p className="mt-1 text-sm text-gray-500">Active categories</p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-500">Browse mode</p>
            <p className="mt-2 text-2xl font-bold text-black">
              {keyword.trim() ? "Search" : selectedCategory ? "Filtered" : "All"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCategory?.name || "No category selected"}
            </p>
          </Card>
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="cursor-pointer rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              disabled={categoryLoading}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <Button variant="secondary" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${products.length} products shown`}
          </p>
        </div>

        {selectedCategory && (
          <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700 shadow-sm">
            Exploring <span className="font-semibold">{selectedCategory.name}</span>
            {selectedCategory.description ? ` — ${selectedCategory.description}` : ""}
          </div>
        )}

        {error && (
          <div className="mt-6">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: size }).map((_, index) => (
              <Card key={index}>
                <div className="animate-pulse">
                  <div className="mb-4 h-44 rounded-3xl bg-gray-200" />
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-10 rounded-2xl bg-gray-200" />
                </div>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No products found"
              description="Try a different search term or clear the filters."
              action={
                <Button variant="secondary" onClick={handleClearFilters}>
                  Reset filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <article className="overflow-hidden">
                    <Link to={`/products/${product.id}`} className="block">
                      <div className="group overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 transition duration-300 hover:shadow-lg">
                        <div className="relative h-48 overflow-hidden">
                          {product.primaryImageUrl ? (
                            <img
                              src={product.primaryImageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100 text-sm font-medium text-gray-400">
                              No image available
                            </div>
                          )}

                          <div className="absolute left-4 top-4">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                categoryStyles[product.categoryName] ||
                                "border-gray-200 bg-white text-gray-700"
                              }`}
                            >
                              {product.categoryName}
                            </span>
                          </div>

                          <div className="absolute bottom-4 right-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
                                product.stock > 0
                                  ? "bg-white text-emerald-700"
                                  : "bg-white text-red-600"
                              }`}
                            >
                              {product.stock > 0
                                ? `In stock: ${product.stock}`
                                : "Out of stock"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-1 text-lg font-semibold text-black">
                          {product.name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                          ₹{product.price}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                        {product.description}
                      </p>

                      <div className="mt-4">
                        <Link to={`/products/${product.id}`} className="block">
                          <Button className="w-full">View details</Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                </Card>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {page + 1} of {Math.max(totalPages, 1)}
              </span>

              <Button
                variant="secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}