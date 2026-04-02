import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { canAccessAdmin, canAccessCandidateDetail, canEditCandidates } from "@/lib/permissions";

const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options: any }>,
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    redirectUrl.searchParams.set("reason", "no-user");
    return NextResponse.redirect(redirectUrl);
  }

  const { data: membership, error: membershipError } = await supabase
    .from("cupid_memberships")
    .select("status, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/pending";
    redirectUrl.searchParams.set("reason", "membership-error");
    redirectUrl.searchParams.set("code", membershipError.code ?? "unknown");
    redirectUrl.searchParams.set("uid", user.id);
    return NextResponse.redirect(redirectUrl);
  }

  if (!membership) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/pending";
    redirectUrl.searchParams.set("reason", "no-membership");
    redirectUrl.searchParams.set("uid", user.id);
    return NextResponse.redirect(redirectUrl);
  }

  if (membership.status !== "approved" && request.nextUrl.pathname !== "/pending") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/pending";
    redirectUrl.searchParams.set("reason", "not-approved");
    redirectUrl.searchParams.set("status", membership.status);
    redirectUrl.searchParams.set("role", membership.role);
    return NextResponse.redirect(redirectUrl);
  }

  if (
    adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route)) &&
    !canAccessAdmin(membership.role)
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  if (
    request.nextUrl.pathname.startsWith("/profiles") &&
    !canAccessCandidateDetail(membership.role)
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.searchParams.set("message", "viewer-role");
    return NextResponse.redirect(redirectUrl);
  }

  if (
    request.nextUrl.pathname.startsWith("/candidates") &&
    !canEditCandidates(membership.role)
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.searchParams.set("message", "editor-role");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profiles/:path*",
    "/admin/:path*",
    "/candidates/:path*",
  ],
};
