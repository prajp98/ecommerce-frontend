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
        className={`flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400 ${className}`}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      onError={() => setImageError(true)}
    />
  );
}