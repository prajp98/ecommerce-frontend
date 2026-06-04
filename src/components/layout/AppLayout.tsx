import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Name, email and password are required");
      return;
    }

    if (formData.password.trim().length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-140px)] bg-gradient-to-b from-white via-blue-50/30 to-pink-50/40 px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[420px_1fr] lg:items-center">
        <Card>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-black">
              Create account
            </h2>
            <p className="text-sm leading-6 text-gray-500">
              Join ShopNest to save addresses, track orders, and shop faster.
            </p>
          </div>

          {error && <div className="mt-6"><Alert variant="error">{error}</Alert></div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

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
                placeholder="At least 8 characters"
              />
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-black underline">
              Login
            </Link>
          </p>
        </Card>

        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
            New here?
          </span>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-black md:text-6xl">
              Create your account and start shopping.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              Save your address, place faster orders, and keep your purchases
              organized in one place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-black">Save</p>
              <p className="mt-1 text-sm text-gray-500">Addresses and order history</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-black">Track</p>
              <p className="mt-1 text-sm text-gray-500">Keep an eye on every order</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-black">Shop</p>
              <p className="mt-1 text-sm text-gray-500">Move through checkout smoothly</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}