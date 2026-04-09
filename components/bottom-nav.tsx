"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/cn";
import { canAccessAdminPanel, canEditCandidates } from "@/lib/role-utils";
import type { AppRole } from "@/lib/types";

type BottomNavProps = {
  role: AppRole;
};

type NavItemProps = {
  href: string;
  label: string;
  isActive: boolean;
  icon: React.ReactNode;
};

function NavItem({ href, label, isActive, icon }: NavItemProps) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "flex size-7 items-center justify-center transition-colors duration-200",
          isActive ? "text-rose-500" : "text-slate-400",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "text-[11px] font-semibold tracking-[0.02em]",
          isActive ? "text-rose-600" : "text-slate-400",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  const isEditor = canEditCandidates(role);
  const isSuper = canAccessAdminPanel(role);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl border-t border-rose-200/80 bg-rose-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(244,114,182,0.1)] backdrop-blur-xl md:hidden"
      aria-label="모바일 메뉴"
    >
      <div className="mx-auto flex max-w-md items-end justify-around px-2 pt-2 pb-2">
        <NavItem
          href="/"
          label="홈"
          isActive={pathname === "/"}
          icon={<Home className="size-5" />}
        />
        <NavItem
          href="/dashboard"
          label="대시보드"
          isActive={pathname === "/dashboard"}
          icon={<LayoutDashboard className="size-5" />}
        />
        {isEditor ? (
          <NavItem
            href="/candidates/new"
            label="등록"
            isActive={pathname === "/candidates/new"}
            icon={<Plus className="size-5" />}
          />
        ) : null}
        {isSuper ? (
          <NavItem
            href="/admin"
            label="관리"
            isActive={pathname === "/admin"}
            icon={<Settings className="size-5" />}
          />
        ) : null}
      </div>
    </nav>
  );
}
