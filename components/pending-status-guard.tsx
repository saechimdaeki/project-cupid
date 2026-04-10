"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PendingStatusGuard() {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;
    let intervalId: number | null = null;

    async function syncStatus() {
      const response = await fetch("/api/membership-status", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok || !isActive) {
        return;
      }

      const payload = (await response.json()) as { status: string | null };

      if (!isActive) {
        return;
      }

      if (payload.status === "approved") {
        router.replace("/dashboard");
        router.refresh();
      }
    }

    void syncStatus();
    intervalId = window.setInterval(() => {
      void syncStatus();
    }, 15000);

    return () => {
      isActive = false;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [router]);

  return null;
}
