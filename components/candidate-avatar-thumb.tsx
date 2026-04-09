import { cn } from "@/lib/cn";

function genderEmoji(gender: string) {
  if (gender === "남") return "🤵";
  if (gender === "여") return "👰";
  return "💌";
}

type CandidateAvatarThumbProps = {
  imageUrl: string | null | undefined;
  gender: string;
  /** Tailwind size, e.g. h-14 w-14 */
  className?: string;
  roundedClassName?: string;
};

export function CandidateAvatarThumb({
  imageUrl,
  gender,
  className = "h-14 w-14",
  roundedClassName = "rounded-2xl",
}: CandidateAvatarThumbProps) {
  const url = imageUrl?.trim();
  const isRenderable =
    url && (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://"));

  if (isRenderable) {
    /* next/image 미사용: 대시보드에 썸네일이 수십 장일 때 Vercel Image Optimization이
       요청을 큐에 쌓아 TTFB 이후에도 느려질 수 있음 → 브라우저 네이티브 lazy 로드 */
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50 shadow-inner",
          className,
          roundedClassName,
        )}
      >
        <img
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 text-2xl shadow-inner",
        className,
        roundedClassName,
      )}
    >
      {genderEmoji(gender)}
    </div>
  );
}
