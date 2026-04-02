"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PersonPreview } from "@/components/person-preview";
import { SakuraRain } from "@/components/sakura-rain";
import { homePreviewCandidates } from "@/lib/preview-scene";
import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/types";

const LOGIN_STORAGE_KEY = "isLoggedIn";
const ROLE_STORAGE_KEY = "userRole";
const NAME_STORAGE_KEY = "userName";

type AuthState = {
  isLoggedIn: boolean;
  userName: string;
  userRole: AppRole | "";
};

const LOGGED_OUT_AUTH: AuthState = {
  isLoggedIn: false,
  userName: "",
  userRole: "",
};

function Header({
  auth,
  onLogin,
  onLogout,
}: {
  auth: AuthState;
  onLogin: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/50 bg-white/30 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-6 py-3 md:px-12 lg:px-24">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-3xl border border-white/60 bg-white/70 text-sm font-semibold text-rose-500 shadow-[0_8px_30px_rgb(244,114,182,0.12)]">
              C
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-sm font-semibold tracking-[-0.02em] text-slate-800 sm:text-base">
                Project Cupid
              </strong>
              <span className="block truncate text-xs text-slate-500">
                사랑이 피어나는 스튜디오
              </span>
            </div>
          </Link>

          {auth.isLoggedIn && auth.userRole === "super_admin" ? (
            <nav
              className="hidden items-center gap-1 rounded-full border border-white/60 bg-white/50 px-2 py-1 shadow-[inset_0_1px_8px_rgba(244,114,182,0.08)] backdrop-blur-sm lg:flex"
              aria-label="최고 관리자 메뉴"
            >
              <Link
                href="/dashboard"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-rose-600"
              >
                대시보드
              </Link>
              <Link
                href="/admin"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-rose-600"
              >
                승인·권한 관리
              </Link>
            </nav>
          ) : null}
        </div>

        {auth.isLoggedIn ? (
          <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-2 py-1.5 shadow-[0_8px_30px_rgb(244,114,182,0.1)] backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100 text-sm font-semibold text-slate-700">
              {auth.userName.trim() ? auth.userName.trim().slice(0, 1) : "?"}
            </div>
            <p className="hidden text-sm font-medium text-slate-600 md:block">
              환영합니다, <span className="text-slate-800">{auth.userName}님</span> ❤️
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="px-2 text-sm font-medium text-slate-500 transition hover:text-rose-500"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="soft-pulse inline-flex h-11 items-center justify-center rounded-full border border-white/60 bg-white/65 px-5 text-sm font-semibold text-slate-700 shadow-[0_8px_30px_rgb(244,114,182,0.1)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/80"
          >
            회원가입 / 로그인
          </button>
        )}
      </div>
    </header>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-white/50 bg-white/60 p-5 shadow-[0_8px_30px_rgb(244,114,182,0.1)] backdrop-blur-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <strong className="mt-3 block text-2xl font-semibold tracking-[-0.04em] text-slate-800">
        {value}
      </strong>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}

function PreviewCard({
  imageUrl,
  title,
  subtitle,
  align,
}: {
  imageUrl: string | null;
  title: string;
  subtitle: string;
  align: "left" | "right";
}) {
  return (
    <article
      className={`absolute top-16 w-[13.8rem] rounded-[32px] border border-white/60 bg-white/70 p-3 shadow-[0_8px_30px_rgb(244,114,182,0.12)] backdrop-blur-lg ${
        align === "left" ? "left-4 rotate-[-13deg] sm:left-8" : "right-4 rotate-[12deg] sm:right-8"
      }`}
    >
      <div className="overflow-hidden rounded-[24px] border border-white/70 bg-rose-50/40">
        <PersonPreview
          imageUrl={imageUrl}
          size="sm"
          fit="cover"
          position="top"
          className="h-44 bg-rose-50/40"
        />
      </div>
      <div className="px-1 pb-1 pt-4">
        <strong className="block text-sm font-semibold tracking-[-0.03em] text-slate-800">
          {title}
        </strong>
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>
    </article>
  );
}

function ConnectionPreview() {
  const leftCandidate = homePreviewCandidates[0];
  const rightCandidate = homePreviewCandidates[1] ?? homePreviewCandidates[0];

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/50 bg-white/60 p-4 shadow-[0_8px_30px_rgb(244,114,182,0.1)] backdrop-blur-lg sm:p-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-14 h-36 w-36 rounded-full bg-rose-200/45 blur-3xl" />
        <div className="absolute right-1/4 top-20 h-40 w-40 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-100/35 blur-3xl" />
      </div>

      <div className="relative flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Cupid Preview
        </p>
        <span className="inline-flex rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-500">
          love in motion
        </span>
      </div>

      <div className="relative mt-4 min-h-[25rem] rounded-[30px] border border-white/60 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.68),rgba(255,247,244,0.62),rgba(255,250,248,0.72))]">
        <PreviewCard
          imageUrl={leftCandidate.image_url}
          align="left"
          title={`${String(leftCandidate.birth_year).slice(2)}년생 서울 기획자`}
          subtitle={`${leftCandidate.full_name} · ${leftCandidate.work_summary}`}
        />
        <PreviewCard
          imageUrl={rightCandidate.image_url}
          align="right"
          title={`${String(rightCandidate.birth_year).slice(2)}년생 경기 개발자`}
          subtitle={`${rightCandidate.full_name} · ${rightCandidate.work_summary}`}
        />

        <svg viewBox="0 0 700 360" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(251 113 133 / 0.22)" />
              <stop offset="50%" stopColor="rgb(251 191 36 / 0.22)" />
              <stop offset="100%" stopColor="rgb(244 114 182 / 0.18)" />
            </linearGradient>
          </defs>
          <path
            d="M120 150 C220 80, 300 240, 400 180 S560 110, 620 150"
            fill="none"
            stroke="url(#beam)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="250" cy="138" r="16" fill="white" stroke="rgb(254 205 211 / 0.75)" />
          <circle cx="360" cy="205" r="16" fill="white" stroke="rgb(254 215 170 / 0.72)" />
          <circle cx="478" cy="158" r="16" fill="white" stroke="rgb(254 205 211 / 0.75)" />
        </svg>

        <div className="absolute left-1/2 top-[36%] -translate-x-1/2 rounded-full border border-white/60 bg-white/72 px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm backdrop-blur">
          첫 연결
        </div>
        <div className="absolute left-1/2 top-[54%] -translate-x-1/2 rounded-full border border-white/60 bg-white/72 px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm backdrop-blur">
          관계 진전
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-[26px] border border-white/60 bg-white/72 p-4 shadow-[0_8px_30px_rgb(244,114,182,0.08)] backdrop-blur-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Studio Mood
          </p>
          <strong className="mt-2 block text-sm font-semibold text-slate-800">
            사랑이 피어나는 스튜디오처럼, 보는 순간 마음이 먼저 따뜻해져야 합니다
          </strong>
          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            설렘과 행복의 기운 속에서, 좋은 인연의 시작을 더 다정하게 준비합니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function InventoryCard({
  title,
  subtitle,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  imageUrl: string | null;
}) {
  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-[32px] border border-white/50 bg-white/60 p-5 shadow-[0_8px_30px_rgb(244,114,182,0.1)] backdrop-blur-md sm:p-6">
      <div className="overflow-hidden rounded-[26px] border border-white/60 bg-rose-50/35">
        <PersonPreview
          imageUrl={imageUrl}
          size="sm"
          fit="cover"
          position="top"
          className="h-72 min-h-[16rem] bg-rose-50/35 sm:h-80"
        />
      </div>
      <div className="px-1 pb-1 pt-5">
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-800">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
    </article>
  );
}

function parseStoredRole(value: string | null): AppRole | "" {
  if (value === "super_admin" || value === "admin" || value === "viewer") return value;
  return "";
}

export default function HomePage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>(LOGGED_OUT_AUTH);

  useEffect(() => {
    function applyLocalStorageFallback() {
      const storedLogin = window.localStorage.getItem(LOGIN_STORAGE_KEY);
      const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
      const storedName = window.localStorage.getItem(NAME_STORAGE_KEY);
      setAuth({
        isLoggedIn: storedLogin === "true",
        userName: storedName ?? "",
        userRole: parseStoredRole(storedRole),
      });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      applyLocalStorageFallback();
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function syncFromSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session) {
        try {
          window.localStorage.removeItem(LOGIN_STORAGE_KEY);
          window.localStorage.removeItem(ROLE_STORAGE_KEY);
          window.localStorage.removeItem(NAME_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setAuth(LOGGED_OUT_AUTH);
        return;
      }

      const { data: row } = await supabase
        .from("cupid_memberships")
        .select("full_name, role, status")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (!row || row.status !== "approved") {
        const metaName = String(session.user.user_metadata?.full_name ?? "").trim();
        setAuth({
          isLoggedIn: true,
          userName: metaName,
          userRole: "",
        });
        return;
      }

      const role = row.role as AppRole;
      setAuth({
        isLoggedIn: true,
        userName: row.full_name?.trim() ?? "",
        userRole: role,
      });

      try {
        window.localStorage.setItem(LOGIN_STORAGE_KEY, "true");
        window.localStorage.setItem(NAME_STORAGE_KEY, row.full_name ?? "");
        window.localStorage.setItem(ROLE_STORAGE_KEY, role);
      } catch {
        /* ignore */
      }
    }

    void syncFromSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncFromSession();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    try {
      window.localStorage.removeItem(LOGIN_STORAGE_KEY);
      window.localStorage.removeItem(ROLE_STORAGE_KEY);
      window.localStorage.removeItem(NAME_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setAuth(LOGGED_OUT_AUTH);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50/30 to-orange-50/50 text-slate-800">
      <SakuraRain petalCount={56} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,242,245,0.84),rgba(255,247,243,0.68),rgba(255,255,255,0.38))]" />

      <Header auth={auth} onLogin={handleLogin} onLogout={handleLogout} />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-6 pb-16 pt-24 md:px-12 lg:px-24">
        <section className="grid gap-16 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] xl:items-start xl:justify-between">
          <article className="landing-reveal rounded-[36px] border border-white/50 bg-white/60 p-6 shadow-[0_8px_30px_rgb(244,114,182,0.1)] backdrop-blur-lg sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Private Love Studio
            </p>
            <h1 className="mt-4 max-w-[10ch] text-[clamp(2.8rem,10vw,5.1rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-slate-800">
              좋은 인연을
              <br />
              잇습니다
            </h1>
            <p className="mt-5 max-w-[58ch] text-sm leading-7 text-slate-500 sm:text-base">
              승인된 사람만 들어와 사진, 이력, 만남의 흐름을 함께 보며 사랑의 시작을 설계하는
              프라이빗 공간입니다. 더 따뜻하고 더 설레는 무드 속에서, 한 사람의 행복한 만남을 준비합니다.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["비공개 매칭 보드", "사진 · 이력 · 온도 기록", "VVIP 운영 권한"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-white/60 bg-white/65 px-4 py-2 text-xs font-medium text-slate-500 shadow-sm backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-col flex-wrap items-start justify-start gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="soft-pulse inline-flex h-12 items-center justify-center rounded-full bg-rose-500 px-6 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(244,114,182,0.22)] transition hover:-translate-y-0.5 hover:bg-rose-600"
              >
                대시보드 이동
              </Link>
              {auth.isLoggedIn && auth.userRole === "super_admin" ? (
                <Link
                  href="/admin"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-rose-500 bg-white px-6 text-sm font-semibold text-rose-500 shadow-sm transition hover:bg-rose-50"
                >
                  권한 관리 페이지
                </Link>
              ) : null}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Access Model"
                value="3단계 권한"
                description="viewer, admin, super_admin으로 분리"
              />
              <StatCard
                label="Candidate Photos"
                value={`${homePreviewCandidates.length}건`}
                description="대표 사진과 상세 갤러리를 함께 관리"
              />
              <StatCard
                label="Trusted Flow"
                value="승인 기반 운영"
                description="행복한 연결을 다정하고 단단하게 설계"
              />
            </div>
          </article>

          <div className="landing-reveal landing-delay-2">
            <ConnectionPreview />
          </div>
        </section>

        <section className="landing-reveal landing-delay-3 rounded-[36px] border border-white/50 bg-white/60 p-6 shadow-[0_8px_30px_rgb(244,114,182,0.1)] backdrop-blur-lg sm:p-7">
          <div className="w-full max-w-none">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Preview Inventory
            </p>
            <h2 className="mt-3 text-[clamp(1.8rem,5vw,3rem)] font-semibold tracking-[-0.05em] text-slate-800">
              승인된 사람만 보는 실제 매물 보드
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              viewer는 여기까지, admin 이상은 상세와 사진 갤러리로 이어집니다.
            </p>
          </div>

          {homePreviewCandidates.length ? (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
              {homePreviewCandidates.map((candidate) => (
                <InventoryCard
                  key={candidate.id}
                  imageUrl={candidate.image_url}
                  title={`${candidate.full_name} · ${candidate.region}`}
                  subtitle={`${candidate.birth_year}년생 · ${candidate.gender} · ${candidate.occupation}`}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[30px] border border-white/60 bg-white/65 px-5 py-8 text-center text-sm text-slate-500 shadow-sm">
              현재 표시할 기본 후보가 없습니다.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
