const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function resolveImageUrl(src?: string | null) {
  if (!src) return "";

  const trimmed = src.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/uploads/")) {
    return `${API_BASE_URL.replace(/\/$/, "")}${trimmed}`;
  }

  if (trimmed.startsWith("uploads/")) {
    return `${API_BASE_URL.replace(/\/$/, "")}/${trimmed}`;
  }

  return trimmed;
}