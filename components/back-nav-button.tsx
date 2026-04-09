"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type BackNavButtonProps = {
  fallbackHref?: string;
};

export function BackNavButton({ fallbackHref = "/dashboard" }: BackNavButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="min-h-12 rounded-full transition hover:-translate-y-0.5"
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
    </Button>
  );
}
