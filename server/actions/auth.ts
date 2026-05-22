"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  findUsernameSchema,
  loginSchema,
  signupSchema,
  type FindUsernameInput,
  type LoginInput,
  type SignupInput,
} from "@/lib/schemas/auth";

type ActionResult = { error: string; field?: string } | { success: true };
type FindUsernameResult =
  | { success: true; usernames: string[] }
  | { error: string; field?: string };

function usernameToEmail(username: string) {
  return `${username}@project-cupid.local`;
}

function maskUsername(username: string) {
  if (username.length <= 2) return "*".repeat(username.length);
  if (username.length <= 4) {
    return `${username.slice(0, 1)}${"*".repeat(username.length - 2)}${username.slice(-1)}`;
  }

  return `${username.slice(0, 2)}${"*".repeat(username.length - 4)}${username.slice(-2)}`;
}

export async function signUpWithPassword(input: SignupInput): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.message, field: issue.path[0]?.toString() };
  }

  const { username, fullName, password } = parsed.data;

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase 환경변수가 없습니다." };

  const { data: usernameExists, error: usernameCheckError } = await supabase.rpc(
    "cupid_username_exists",
    { input_username: username },
  );

  if (!usernameCheckError && usernameExists) {
    return {
      error: "이미 사용 중인 아이디입니다. 다른 아이디로 가입해주세요.",
      field: "username",
    };
  }

  const { error } = await supabase.auth.signUp({
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
      return {
        error:
          "가입 저장 중 오류가 났습니다. 같은 아이디가 이미 있거나 Supabase 스키마가 최신이 아닐 수 있습니다.",
      };
    }
    return { error: error.message };
  }

  redirect("/pending");
}

export async function signInWithPassword(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.message, field: issue.path[0]?.toString() };
  }

  const { username, password } = parsed.data;

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase 환경변수가 없습니다." };

  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    return { error: "아이디 또는 비밀번호를 다시 확인해주세요." };
  }

  redirect("/dashboard");
}

export async function findUsernamesByFullName(
  input: FindUsernameInput,
): Promise<FindUsernameResult> {
  const parsed = findUsernameSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.message, field: issue.path[0]?.toString() };
  }

  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin
      .from("cupid_memberships")
      .select("username")
      .ilike("full_name", parsed.data.fullName)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) {
      const usernames = Array.isArray(data)
        ? data
            .map((row) => row?.username)
            .filter((value): value is string => typeof value === "string" && value.length > 0)
            .map(maskUsername)
        : [];

      return { success: true, usernames };
    }
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase 환경변수가 없습니다." };
  const { data, error } = await supabase.rpc("cupid_find_masked_usernames_by_full_name", {
    input_full_name: parsed.data.fullName,
  });

  if (error) {
    return { error: "아이디 조회 중 오류가 났습니다. 잠시 후 다시 시도해주세요." };
  }

  const usernames = Array.isArray(data)
    ? data
        .map((row) => row?.masked_username)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    : [];

  return { success: true, usernames };
}

export async function signOut() {
  const supabase = await createClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
