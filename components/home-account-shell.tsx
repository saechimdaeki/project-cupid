"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type HomeMembershipState = {
  username: string;
  full_name: string;
  role: "super_admin" | "admin" | "viewer";
  status: "pending" | "approved" | "rejected";
};

function getRoleLabel(role: HomeMembershipState["role"]) {
  switch (role) {
    case "super_admin":
      return "슈퍼어드민";
    case "admin":
      return "어드민";
    default:
      return "뷰어";
  }
}

export function HomeAccountShell() {
  const supabase = useMemo(() => createClient(), []);
  const [membership, setMembership] = useState<HomeMembershipState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMembership() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !active) {
          setLoaded(true);
          return;
        }

        const { data } = await supabase
          .from("cupid_memberships")
          .select("username, full_name, role, status")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .maybeSingle();

        if (!active) {
          return;
        }

        setMembership((data as HomeMembershipState | null) ?? null);
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    }

    void loadMembership();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.replace("/");
  }

  if (!loaded) {
    return (
      <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[320px]">
        <div className="rounded-[28px] border border-[#ead8cf] bg-gradient-to-br from-white to-[#fff6ef] p-5 shadow-[0_14px_40px_rgba(143,95,89,0.1)]">
          <div className="h-3 w-20 rounded-full bg-[#f3e4db]" />
          <div className="mt-4 h-9 w-40 rounded-full bg-[#f7ece6]" />
          <div className="mt-3 h-5 w-32 rounded-full bg-[#f4e7e1]" />
          <div className="mt-5 h-12 rounded-full bg-[#fffaf7]" />
        </div>
      </div>
    );
  }

  if (membership) {
    return (
      <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[320px]">
        <div className="rounded-[28px] border border-[#ead8cf] bg-gradient-to-br from-white to-[#fff6ef] p-5 shadow-[0_14px_40px_rgba(143,95,89,0.1)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b46d59]">
            환영합니다
          </p>
          <strong className="mt-2 block text-[clamp(1.75rem,7vw,2.4rem)] font-semibold tracking-[-0.06em] text-[#24161c]">
            {membership.full_name}님
          </strong>
          <span className="mt-2 block text-sm leading-6 text-[#7a636b] sm:text-base">
            @{membership.username} · {getRoleLabel(membership.role)}
          </span>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-5 text-sm font-semibold text-[#2b1b11] shadow-[0_10px_24px_rgba(198,132,99,0.18)] transition hover:-translate-y-0.5"
              href="/dashboard"
            >
              대시보드
            </Link>
            {membership.role === "super_admin" ? (
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5"
                href="/admin"
              >
                승인 관리
              </Link>
            ) : null}
          </div>
          <button
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5"
            type="button"
            onClick={() => {
              void handleSignOut();
            }}
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
      <Link
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5 lg:w-auto"
        href="/login"
      >
        회원가입 / 로그인
      </Link>
      <Link
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-5 text-sm font-semibold text-[#2b1b11] shadow-[0_10px_24px_rgba(198,132,99,0.18)] transition hover:-translate-y-0.5 lg:w-auto"
        href="/dashboard"
      >
        보드 열기
      </Link>
    </div>
  );
}
