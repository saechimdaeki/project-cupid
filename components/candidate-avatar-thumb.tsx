import Image from "next/image";
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
    url &&
    (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://"));

  if (isRenderable) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50 shadow-inner",
          className,
          roundedClassName,
        )}
      >
        <Image src={url} alt="" fill sizes="64px" className="object-cover" />
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
