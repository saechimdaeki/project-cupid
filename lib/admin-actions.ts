"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canEditCandidates, canManageRoles, getCurrentMembership } from "@/lib/permissions";

async function requireMembership() {
  const membership = await getCurrentMembership();

  if (!membership || membership.status !== "approved") {
    redirect("/login?message=승인된 계정만 접근할 수 있습니다.");
  }

  return membership;
}

export async function updateMembershipRole(formData: FormData) {
  const membership = await requireMembership();

  if (!canManageRoles(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const userId = String(formData.get("userId") ?? "");
  const nextRole = String(formData.get("role") ?? "viewer");
  const nextStatus = String(formData.get("status") ?? "approved");
  const supabase = await createClient();

  if (userId === membership.user_id) {
    redirect("/admin?message=자기 자신의 권한은 여기서 변경할 수 없습니다.");
  }

  if (!supabase) {
    redirect("/admin?message=Supabase 환경변수가 없습니다.");
  }

  const { error } = await supabase
    .from("cupid_memberships")
    .update({
      role: nextRole,
      status: nextStatus,
      approved_by: membership.user_id,
      approved_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    redirect(`/admin?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/pending");
  redirect("/admin?message=권한이 반영되었습니다.");
}

export async function rejectMembership(formData: FormData) {
  const membership = await requireMembership();

  if (!canManageRoles(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const userId = String(formData.get("userId") ?? "");
  const supabase = await createClient();

  if (!supabase) {
    redirect("/admin?message=Supabase 환경변수가 없습니다.");
  }

  const { error } = await supabase
    .from("cupid_memberships")
    .update({
      status: "rejected",
      approved_by: membership.user_id,
      approved_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    redirect(`/admin?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/pending");
  redirect("/admin?message=가입 요청을 거절했습니다.");
}

export async function createCandidate(formData: FormData) {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const supabase = await createClient();

  if (!supabase) {
    redirect("/candidates/new?message=Supabase 환경변수가 없습니다.");
  }

  const highlightTags = String(formData.get("highlightTags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const photoUrls = String(formData.get("photoUrls") ?? "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

  const payload = {
    full_name: String(formData.get("fullName") ?? "").trim(),
    birth_year: Number(formData.get("birthYear") ?? 0),
    gender: String(formData.get("gender") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim(),
    occupation: String(formData.get("occupation") ?? "").trim(),
    work_summary: String(formData.get("workSummary") ?? "").trim(),
    education: String(formData.get("education") ?? "").trim(),
    religion: String(formData.get("religion") ?? "").trim(),
    mbti: String(formData.get("mbti") ?? "").trim() || null,
    personality_summary: String(formData.get("personalitySummary") ?? "").trim(),
    ideal_type: String(formData.get("idealType") ?? "").trim(),
    notes_private: String(formData.get("notesPrivate") ?? "").trim(),
    status: String(formData.get("status") ?? "active"),
    highlight_tags: highlightTags,
    image_url: photoUrls[0] ?? null,
    created_by: membership.user_id,
  };

  const { data, error } = await supabase
    .from("cupid_candidates")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/candidates/new?message=${encodeURIComponent(error?.message ?? "등록에 실패했습니다.")}`);
  }

  if (photoUrls.length) {
    const photosPayload = photoUrls.map((imageUrl, index) => ({
      candidate_id: data.id,
      image_url: imageUrl,
      sort_order: index,
      is_primary: index === 0,
    }));

    await supabase.from("cupid_candidate_photos").insert(photosPayload);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/profiles/${data.id}`);
  redirect(`/profiles/${data.id}`);
}
