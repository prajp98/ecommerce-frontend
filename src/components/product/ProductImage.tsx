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
    if (!src) {
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
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }