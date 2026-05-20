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
    <section className="mx-auto max-w-7xl px-4 py-10">
      <PageHeader
        title="Products"
        subtitle="Browse products, search by name, or filter by category."
        action={
          <form onSubmit={handleSearch} className="flex w-full gap-3 md:max-w-xl">
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

          <Button variant="secondary" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : `${products.length} products shown`}
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: size }).map((_, index) => (
            <Card key={index}>
              <div className="animate-pulse">
                <div className="mb-4 h-40 rounded-2xl bg-gray-200" />
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-10 rounded-2xl bg-gray-200" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try a different search term or clear the filters."
          action={
            <Button variant="secondary" onClick={handleClearFilters}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.id}
              children={
                <article className="overflow-hidden">
                  <div className="h-48 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200" />
                  <div className="pt-5">
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
                        {product.stock > 0
                          ? `Stock: ${product.stock}`
                          : "Out of stock"}
                      </span>
                    </div>

                    <Link
                      to={`/products/${product.id}`}
                      className="mt-4 block"
                    >
                      <Button className="w-full">View details</Button>
                    </Link>
                  </div>
                </article>
              }
            />
          ))}
        </div>
      )}

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
    </section>
  );
}