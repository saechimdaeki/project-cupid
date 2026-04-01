"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AuthFormsProps = {
  initialMessage?: string;
};

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function usernameToEmail(username: string) {
  return `${username}@project-cupid.local`;
}

function validateUsername(username: string) {
  return /^[a-z0-9._-]{4,20}$/.test(username);
}

export function AuthForms({ initialMessage }: AuthFormsProps) {
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState(initialMessage ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp(formData: FormData) {
    setIsSubmitting(true);
    const username = normalizeUsername(String(formData.get("username") ?? ""));
    const fullName = String(formData.get("fullName") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!validateUsername(username)) {
      setMessage("id는 영문 소문자, 숫자, ., _, - 조합 4-20자로 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    if (fullName.length < 2) {
      setMessage("이름을 2자 이상 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setMessage("비밀번호는 6자 이상이어야 합니다.");
      setIsSubmitting(false);
      return;
    }

    const { data: usernameExists, error: usernameCheckError } = await supabase.rpc(
      "cupid_username_exists",
      { input_username: username },
    );

    if (!usernameCheckError && usernameExists) {
      setMessage("이미 사용 중인 id입니다. 다른 id로 가입해주세요.");
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (error) {
      if (error.message.includes("Database error saving new user")) {
        setMessage("가입 저장 중 오류가 났습니다. 같은 id가 이미 있거나 Supabase 스키마가 최신이 아닐 수 있습니다.");
        setIsSubmitting(false);
        return;
      }

      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (!data.session) {
      setMessage("회원가입은 완료됐습니다. Supabase Auth에서 Confirm email을 꺼두면 바로 로그인됩니다.");
      setIsSubmitting(false);
      return;
    }

    window.location.replace("/auth/continue");
  }

  async function handleSignIn(formData: FormData) {
    setIsSubmitting(true);
    const username = normalizeUsername(String(formData.get("username") ?? ""));
    const password = String(formData.get("password") ?? "");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });

    if (error) {
      setMessage("id 또는 비밀번호를 다시 확인해주세요.");
      setIsSubmitting(false);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setMessage("로그인 세션을 확인하지 못했습니다. 다시 시도해주세요.");
      setIsSubmitting(false);
      return;
    }

    window.location.replace("/auth/continue");
  }

  return (
    <div className="authStack">
      <div className="authPanel">
        <p className="eyebrow">Sign Up</p>
        <h2 className="pageTitle">회원가입</h2>
        <p className="pageMeta">id, 이름, password만 입력하면 가입 요청이 생성됩니다.</p>

        {message ? <div className="notice">{message}</div> : null}

        <form
          className="authForm"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            await handleSignUp(formData);
          }}
        >
          <label>
            id
            <input name="username" placeholder="junseong" required />
          </label>
          <label>
            이름
            <input name="fullName" placeholder="김준성" required />
          </label>
          <label>
            password
            <input name="password" type="password" placeholder="6자 이상" required />
          </label>
          <button className="primaryButton" type="submit" disabled={isSubmitting}>
            가입 요청하기
          </button>
        </form>
      </div>

      <div className="authPanel">
        <p className="eyebrow">Sign In</p>
        <h2 className="pageTitle">로그인</h2>
        <p className="pageMeta">승인된 계정만 보드에 들어갈 수 있습니다.</p>

        <form
          className="authForm"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            await handleSignIn(formData);
          }}
        >
          <label>
            id
            <input name="username" placeholder="junseong" required />
          </label>
          <label>
            password
            <input name="password" type="password" placeholder="비밀번호 입력" required />
          </label>
          <button className="primaryButton" type="submit" disabled={isSubmitting}>
            로그인
          </button>
        </form>

        <div className="heroActions">
          <Link className="ghostButton" href="/">
            랜딩으로 돌아가기
          </Link>
          <Link className="ghostButton" href="/pending">
            승인 대기 페이지
          </Link>
        </div>
      </div>

      <div className="sectionBlock authHint">
        가입 후 `cupid_memberships`에 `username + full_name + pending`으로 들어가고,
        슈퍼어드민이 `viewer` 또는 `admin` 권한을 승인하면 보드 접근이 열립니다.
      </div>
    </div>
  );
}
