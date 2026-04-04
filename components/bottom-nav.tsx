"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { canAccessAdminPanel, canEditCandidates } from "@/lib/role-utils";
import type { AppRole } from "@/lib/types";

type BottomNavProps = {
  role: AppRole;
};

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" strokeLinejoin="round" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" strokeLinejoin="round" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" strokeLinejoin="round" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

type NavItemProps = {
  href: string;
  label: string;
  isActive: boolean;
  icon: React.ReactNode;
};

function NavItem({ href, label, isActive, icon }: NavItemProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1"
    >
      <span className={cn(
        "flex size-7 items-center justify-center transition-colors duration-200",
        isActive ? "text-rose-500" : "text-slate-400",
      )}>
        {icon}
      </span>
      <span className={cn(
        "text-[11px] font-semibold tracking-[0.02em]",
        isActive ? "text-rose-600" : "text-slate-400",
      )}>
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
          icon={<HomeIcon className="size-5" />}
        />
        <NavItem
          href="/dashboard"
          label="대시보드"
          isActive={pathname === "/dashboard"}
          icon={<DashboardIcon className="size-5" />}
        />
        {isEditor ? (
          <NavItem
            href="/candidates/new"
            label="등록"
            isActive={pathname === "/candidates/new"}
            icon={<PlusIcon className="size-5" />}
          />
        ) : null}
        {isSuper ? (
          <NavItem
            href="/admin"
            label="관리"
            isActive={pathname === "/admin"}
            icon={<AdminIcon className="size-5" />}
          />
        ) : null}
      </div>
    </nav>
  );
}
