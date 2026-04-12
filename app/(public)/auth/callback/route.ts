import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/pending";

  if (
    !code ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  ) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(new URL(next, url.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  // OAuth 로그인 후 멤버십 상태에 따라 목적지 결정
  if (next === "/dashboard") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: membership } = await supabase
        .from("cupid_memberships")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!membership || membership.status !== "approved") {
        const redirectUrl = new URL("/pending", url.origin);
        const pendingResponse = NextResponse.redirect(redirectUrl);
        response.cookies.getAll().forEach((cookie) => {
          pendingResponse.cookies.set(cookie.name, cookie.value);
        });
        return pendingResponse;
      }
    }
  }

  return response;
}
