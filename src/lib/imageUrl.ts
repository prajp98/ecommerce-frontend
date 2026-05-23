const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function resolveImageUrl(src?: string | null) {
  if (!src) return "";

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (src.startsWith("/uploads/")) {
    return `${API_BASE_URL}${src}`;
  }

  return src;
}