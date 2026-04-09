type ProfilePortraitProps = {
  imageUrl?: string | null;
  sizes: string;
  className?: string;
  roundedClassName?: string;
  priority?: boolean;
};

/**
 * 상세 등 고정 비율 프로필 영역: 이미지는 object-cover, 없으면 로즈 톤 폴백
 */
export function ProfilePortrait({
  imageUrl,
  sizes,
  className = "",
  roundedClassName = "rounded-3xl",
  priority,
}: ProfilePortraitProps) {
  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden bg-rose-50 ${roundedClassName} ${className}`.trim()}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          sizes={sizes}
          className={`h-full w-full object-cover object-center ${roundedClassName}`}
        />
      ) : (
        <div
          className={`flex h-full min-h-[160px] w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-rose-100 via-rose-50 to-pink-50 p-4 text-center ${roundedClassName}`}
        >
          <span className="text-3xl" aria-hidden>
            💌
          </span>
          <p className="text-xs font-medium text-rose-400 sm:text-sm">대표 사진을 준비 중이에요</p>
        </div>
      )}
    </div>
  );
}
