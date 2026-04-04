"use client";

import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-actions";
import { getRoleLabel } from "@/lib/role-utils";
import type { AppRole } from "@/lib/types";

type NavProfileMenuProps = {
  fullName: string;
  username: string;
  role: AppRole;
};

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

export function NavProfileMenu({ fullName, username, role }: NavProfileMenuProps) {
  const [pending, startTransition] = useTransition();
  const initial = fullName.trim().slice(0, 1) || "?";

  function handleLogout() {
    clearClientAuthMirror();
    startTransition(async () => {
      try {
        await signOut();
      } catch {
        /* redirect() from server action */
      }
      window.location.reload();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-full border border-white/60 bg-white/70 py-1 pl-1 pr-2 shadow-sm backdrop-blur-sm transition hover:bg-white/90 md:gap-2.5 md:pr-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100 text-sm font-semibold text-foreground">
          {initial}
        </div>
        <span className="hidden max-w-[8rem] truncate text-sm font-medium text-foreground md:block">
          {fullName}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground">{fullName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              @{username} · {getRoleLabel(role)}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onClick={handleLogout}
          className="cursor-pointer gap-2 px-3 py-2 text-muted-foreground"
        >
          <LogOutIcon className="size-4" />
          {pending ? "로그아웃 중..." : "로그아웃"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
