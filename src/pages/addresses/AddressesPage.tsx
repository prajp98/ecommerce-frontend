import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

type Address = {
  id: number;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  defaultAddress: boolean;
  userId: number;
};

type AddressResponseWrapper = {
  timestamp: string;
  status: number;
  message: string;
  data: Address[];
};

export default function AddressesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    defaultAddress: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [defaultingId, setDefaultingId] = useState<number | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<AddressResponseWrapper>("/addresses/me");
      setAddresses(response.data.data);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load addresses";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, navigate]);

  const resetForm = () => {
    setFormData({
      line1: "",
      line2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      defaultAddress: false,
    });
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.line1.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.zipCode.trim() ||
      !formData.country.trim()
    ) {
      const message = "Please fill all required fields";
      setError(message);
      showToast(message, "error");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await api.put(`/addresses/${editingId}`, formData);
        showToast("Address updated successfully", "success");
      } else {
        await api.post("/addresses", formData);
        showToast("Address added successfully", "success");
      }

      resetForm();
      await fetchAddresses();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save address";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      defaultAddress: address.defaultAddress,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (addressId: number) => {
    try {
      setDeletingId(addressId);
      setError("");

      await api.delete(`/addresses/${addressId}`);
      await fetchAddresses();
      showToast("Address deleted successfully", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to delete address";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      setDefaultingId(addressId);
      setError("");

      await api.patch(`/addresses/${addressId}/default`);
      await fetchAddresses();
      showToast("Default address updated successfully", "success");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to set default address";
      setError(message);
      showToast(message, "error");
    } finally {
      setDefaultingId(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Addresses
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Add shipping addresses and choose a default address for checkout.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-black">
            {editingId ? "Edit address" : "Add new address"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              name="line1"
              value={formData.line1}
              onChange={handleChange}
              placeholder="Address line 1"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
            />
            <input
              name="line2"
              value={formData.line2}
              onChange={handleChange}
              placeholder="Address line 2 (optional)"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="Zip code"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="defaultAddress"
                checked={formData.defaultAddress}
                onChange={handleChange}
              />
              Set as default address
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                  ? "Update address"
                  : "Add address"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="cursor-pointer rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl bg-white p-6 shadow-sm">Loading...</div>
          ) : addresses.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">No addresses saved yet.</p>
            </div>
          ) : (
            addresses.map((address) => (
              <article
                key={address.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-black">
                        {address.line1}
                      </h3>
                      {address.defaultAddress && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {address.line2 && `${address.line2}, `}
                      {address.city}, {address.state} - {address.zipCode},{" "}
                      {address.country}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleEdit(address)}
                      className="cursor-pointer rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    {!address.defaultAddress && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        disabled={defaultingId === address.id}
                        className="cursor-pointer rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
                      >
                        {defaultingId === address.id
                          ? "Setting..."
                          : "Make default"}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingId === address.id}
                      className="cursor-pointer rounded-2xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {deletingId === address.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/cart"
          className="inline-flex cursor-pointer rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Back to cart
        </Link>
      </div>
    </section>
  );
}