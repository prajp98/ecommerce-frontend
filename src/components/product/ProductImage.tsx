import { useState } from "react";
import { resolveImageUrl } from "../../lib/imageUrl";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
};

export default function ProductImage({
  src,
  alt,
  className = "",
  fallbackText = "No image available",
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const resolvedSrc = resolveImageUrl(src);

  if (!resolvedSrc || imageError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50 text-sm font-medium text-gray-400 ${className}`}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base shadow-sm">
            ✦
          </div>
          <span>{fallbackText}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={`h-full w-full object-cover transition duration-300 hover:scale-[1.02] ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
}