import Image from "next/image";

type PersonPreviewProps = {
  imageUrl?: string | null;
  gender?: string | null;
  className?: string;
  size?: "sm" | "lg";
  fit?: "cover" | "contain";
  position?: "center" | "top";
  loading?: "eager" | "lazy";
  fetchPriority?: "auto" | "high" | "low";
};

function getFallbackClass(gender?: string | null) {
  if (gender?.includes("여")) {
    return "female";
  }

  if (gender?.includes("남")) {
    return "male";
  }

  return "neutral";
}

export function PersonPreview({
  imageUrl,
  gender,
  className = "",
  size = "lg",
  fit = "cover",
  position = "center",
  loading = "lazy",
  fetchPriority = "auto",
}: PersonPreviewProps) {
  const fallbackClass = getFallbackClass(gender);
  const sizes =
    size === "lg"
      ? "(min-width: 1280px) 32vw, (min-width: 1024px) 45vw, 100vw"
      : "(min-width: 1280px) 18vw, (min-width: 768px) 24vw, 46vw";

  return (
    <div
      className={`personPreview relative overflow-hidden ${size} ${imageUrl ? "hasImage" : `fallback ${fallbackClass}`} ${className}`.trim()}
      aria-hidden="true"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes={sizes}
          className={`${fit === "contain" ? "object-contain" : "object-cover"} ${position === "top" ? "object-top" : "object-center"}`}
          fetchPriority={fetchPriority}
          loading={loading}
        />
      ) : (
        <>
          <div className="personPreviewGlow" />
          <div className="personPreviewSilhouette">
            <div className="personPreviewHead" />
            <div className="personPreviewBody" />
          </div>
        </>
      )}
    </div>
  );
}
