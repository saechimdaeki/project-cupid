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
      className="ghostButton"
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
