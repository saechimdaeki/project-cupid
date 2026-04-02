"use client";

import { useRouter } from "next/navigation";

type BackNavButtonProps = {
  fallbackHref?: string;
};

export function BackNavButton({
  fallbackHref = "/dashboard",
}: BackNavButtonProps) {
  const router = useRouter();

  return (
    <button
      className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5"
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }

        router.push(fallbackHref);
      }}
    >
      뒤로 가기
    </button>
  );
}
