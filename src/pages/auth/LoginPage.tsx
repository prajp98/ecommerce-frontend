import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      login(response.data.data);
      navigate("/products");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-140px)] bg-gradient-to-b from-white via-pink-50/30 to-blue-50/40 px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-700 shadow-sm">
            Welcome back
          </span>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-black md:text-6xl">
              Sign in to continue shopping.
            </h1>
            <p className="max-w-xl text-base leading-7 text-gray-600 md:text-lg">
              Pick up where you left off, review your cart, and keep track of
              your orders with a smooth checkout experience.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-black">Fast</p>
              <p className="mt-1 text-sm text-gray-500">Quick access to your account</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-black">Secure</p>
              <p className="mt-1 text-sm text-gray-500">Protected sign-in flow</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-black">Simple</p>
              <p className="mt-1 text-sm text-gray-500">Clean and easy navigation</p>
            </div>
          </div>
        </div>

        <Card>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-black">
              Login
            </h2>
            <p className="text-sm leading-6 text-gray-500">
              Sign in with your email and password.
            </p>
          </div>

          {error && <div className="mt-6"><Alert variant="error">{error}</Alert></div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="font-medium text-black underline">
              Register
            </Link>
          </p>
        </Card>
      </div>
    </section>
  );
}