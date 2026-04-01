"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function usernameToEmail(username: string) {
  return `${username}@project-cupid.local`;
}

function validateUsername(username: string) {
  return /^[a-z0-9._-]{4,20}$/.test(username);
}

export async function signUpWithPassword(formData: FormData) {
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?message=Supabase 환경변수가 없습니다.");
  }

  if (!validateUsername(username)) {
    redirect("/login?message=id는 영문 소문자, 숫자, ., _, - 조합 4-20자로 입력해주세요.");
  }

  if (fullName.length < 2) {
    redirect("/login?message=이름을 2자 이상 입력해주세요.");
  }

  if (password.length < 6) {
    redirect("/login?message=비밀번호는 6자 이상이어야 합니다.");
  }

  const { data: usernameExists, error: usernameCheckError } = await supabase.rpc(
    "cupid_username_exists",
    { input_username: username },
  );

  if (!usernameCheckError && usernameExists) {
    redirect("/login?message=이미 사용 중인 id입니다. 다른 id로 가입해주세요.");
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
      redirect(
        "/login?message=가입 저장 중 오류가 났습니다. 같은 id가 이미 있거나 Supabase 스키마가 최신이 아닐 수 있습니다.",
      );
    }

    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect("/login?message=회원가입은 완료됐습니다. Supabase Auth에서 Confirm email을 꺼두면 바로 로그인됩니다.");
  }

  redirect("/pending");
}

export async function signInWithPassword(formData: FormData) {
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?message=Supabase 환경변수가 없습니다.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    redirect("/login?message=id 또는 비밀번호를 다시 확인해주세요.");
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
