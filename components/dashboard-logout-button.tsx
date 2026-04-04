"use client";

import { useTransition } from "react";
import { signOut } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function clearClientAuthMirror() {
  try {
    window.localStorage.removeItem("isLoggedIn");
    window.localStorage.removeItem("userRole");
    window.localStorage.removeItem("userName");
  } catch {
    /* ignore */
  }
}

type DashboardLogoutButtonProps = {
  className?: string;
};

export function DashboardLogoutButton({ className }: DashboardLogoutButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      type="button"
      disabled={pending}
      aria-label="로그아웃"
      className={className}
      onClick={() => {
        clearClientAuthMirror();
        startTransition(async () => {
          try {
            await signOut();
          } catch {
            /* redirect() from server action */
          }
          window.location.reload();
        });
      }}
    >
      <LogOutIcon className="mx-auto h-5 w-5 md:hidden" />
      <span className="hidden md:inline">로그아웃</span>
    </Button>
  );
}
