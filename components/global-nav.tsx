import Link from "next/link";
import { signOut } from "@/lib/auth-actions";
import { canEditCandidates, roleLabel } from "@/lib/role-utils";
import type { Membership } from "@/lib/types";

type GlobalNavProps = {
  membership: Membership;
  active?: "dashboard" | "candidates" | "profile";
};

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M6.5 8.5a5.5 5.5 0 1 1 11 0v2.2c0 .8.26 1.58.74 2.22L19.5 14.5H4.5l1.26-1.58c.48-.64.74-1.42.74-2.22V8.5Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

function NavLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {label}
    </Link>
  );
}

export function GlobalNav({ membership, active = "dashboard" }: GlobalNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 text-sm font-semibold text-white shadow-sm">
              CP
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[0.18em] text-slate-800">
                PROJECT CUPID
              </p>
              <p className="truncate text-xs text-slate-400">Cupid Private</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full bg-slate-50 p-1 md:flex">
            <NavLink href="/dashboard" label="대시보드" active={active === "dashboard"} />
            <NavLink
              href="/dashboard?view=inventory"
              label="매물 관리"
              active={active === "candidates"}
            />
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {canEditCandidates(membership.role) ? (
            <Link
              href="/candidates/new"
              className="hidden rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 sm:inline-flex"
            >
              매물 등록
            </Link>
          ) : null}
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm"
            aria-label="알림"
          >
            <BellIcon />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {membership.full_name.slice(0, 1)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-700">{membership.full_name}</p>
              <p className="text-xs text-slate-400">{roleLabel(membership.role)}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="hidden text-xs font-medium text-slate-500 hover:text-slate-800 sm:block"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
