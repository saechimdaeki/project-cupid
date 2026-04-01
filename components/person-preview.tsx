import type { CSSProperties } from "react";

type PersonPreviewProps = {
  imageUrl?: string | null;
  gender?: string | null;
  className?: string;
  size?: "sm" | "lg";
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
}: PersonPreviewProps) {
  const fallbackClass = getFallbackClass(gender);
  const style = imageUrl
    ? ({
        backgroundImage: `url(${imageUrl})`,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={`personPreview ${size} ${imageUrl ? "hasImage" : `fallback ${fallbackClass}`} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      {imageUrl ? null : (
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
