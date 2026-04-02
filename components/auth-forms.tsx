"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth-actions";

type AuthFormsProps = {
  initialMessage?: string;
};

type AuthTab = "signin" | "signup";

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-rose-200 focus:ring-2 focus:ring-rose-200";

export function AuthForms({ initialMessage }: AuthFormsProps) {
  const [tab, setTab] = useState<AuthTab>("signin");
  const message = initialMessage ?? "";

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg sm:p-6">
      <div className="inline-flex rounded-full bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("signin")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === "signin" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === "signup" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
          }`}
        >
          회원가입
        </button>
      </div>

      <div className="mt-5">
        {tab === "signin" ? (
          <>
            <p className="text-sm font-medium text-slate-500">Sign In</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
              승인된 계정으로 보드에 입장하세요
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              승인된 계정만 대시보드와 매칭 운영 화면에 접근할 수 있습니다.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-500">Sign Up</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
              가입 요청을 보내고 승인 대기열에 등록하세요
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              id, 이름, 비밀번호만 입력하면 슈퍼어드민 검토를 위한 가입 요청이 생성됩니다.
            </p>
          </>
        )}
      </div>

      {message ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {message}
        </div>
      ) : null}

      {tab === "signin" ? (
        <form className="mt-6 grid gap-4" action={signInWithPassword}>
          <FieldShell label="id">
            <input
              className={inputClassName}
              name="username"
              placeholder="junseong"
              required
              minLength={4}
              maxLength={20}
              pattern="[a-z0-9._-]{4,20}"
            />
          </FieldShell>
          <FieldShell label="password">
            <input
              className={inputClassName}
              name="password"
              type="password"
              placeholder="비밀번호 입력"
              required
            />
          </FieldShell>

          <button
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-rose-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
            type="submit"
          >
            로그인
          </button>
        </form>
      ) : (
        <form className="mt-6 grid gap-4" action={signUpWithPassword}>
          <FieldShell label="id">
            <input
              className={inputClassName}
              name="username"
              placeholder="junseong"
              required
              minLength={4}
              maxLength={20}
              pattern="[a-z0-9._-]{4,20}"
            />
          </FieldShell>
          <FieldShell label="이름">
            <input className={inputClassName} name="fullName" placeholder="김준성" required minLength={2} />
          </FieldShell>
          <FieldShell label="password">
            <input
              className={inputClassName}
              name="password"
              type="password"
              placeholder="6자 이상"
              required
              minLength={6}
            />
          </FieldShell>

          <button
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-rose-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
            type="submit"
          >
            가입 요청하기
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          href="/"
        >
          랜딩으로 돌아가기
        </Link>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          href="/pending"
        >
          승인 대기 페이지
        </Link>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
        가입 후 `cupid_memberships`에 `username + full_name + pending`으로 등록되고, 슈퍼어드민이
        `viewer` 또는 `admin` 권한을 승인하면 보드 접근이 열립니다.
      </div>
    </article>
  );
}
