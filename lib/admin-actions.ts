"use server";

import { redirect } from "next/navigation";
import { formatCandidateBrief } from "@/lib/candidate-display";
import { createClient } from "@/lib/supabase/server";
import { buildPairMatchRecordsOrFilter, ONGOING_MATCH_OUTCOMES } from "@/lib/match-flow-columns";
import { canEditCandidates, canManageRoles, getCurrentMembership } from "@/lib/permissions";
import type { CandidateStatus, Membership } from "@/lib/types";

const CANDIDATE_PHOTOS_BUCKET = "sogaeting";
const MAX_TOTAL_UPLOAD_BYTES = 45 * 1024 * 1024;
const MAX_SINGLE_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const CANDIDATE_STATUS_VALUES = new Set([
  "active",
  "matched",
  "couple",
  "graduated",
  "archived",
]);
const MATCH_OUTCOME_VALUES = new Set([
  "intro_sent",
  "first_meeting",
  "dating",
  "couple",
  "closed",
]);
const PAIR_REQUIRED_STATUS_VALUES = new Set(["matched", "couple"]);
const GENDER_VALUES = new Set(["남", "여"]);

function redirectWithMessage(path: string, message: string) {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

async function requireMembership(): Promise<Membership> {
  const membership = await getCurrentMembership();

  if (!membership || membership.status !== "approved") {
    redirectWithMessage("/login", "승인된 계정만 접근할 수 있습니다.");
  }

  return membership as Membership;
}

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

async function requireSupabaseClient(path: string): Promise<SupabaseServerClient> {
  const supabase = await createClient();

  if (!supabase) {
    redirectWithMessage(path, "Supabase 환경변수가 없습니다.");
  }

  return supabase as SupabaseServerClient;
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function safeFileName(fileName: string) {
  const trimmed = fileName.trim().toLowerCase();
  const dotIndex = trimmed.lastIndexOf(".");
  const base = dotIndex >= 0 ? trimmed.slice(0, dotIndex) : trimmed;
  const ext = dotIndex >= 0 ? trimmed.slice(dotIndex) : "";

  const normalizedBase =
    base
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "photo";

  const normalizedExt = ext.replace(/[^.a-z0-9]/g, "");

  return `${normalizedBase}${normalizedExt || ".jpg"}`;
}

async function uploadCandidatePhotos(
  supabase: SupabaseServerClient,
  candidateId: string,
  files: File[],
) {
  const totalUploadBytes = files.reduce((sum, file) => sum + file.size, 0);

  if (totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
    throw new Error("사진 총 용량은 45MB 이하로 맞춰주세요.");
  }

  const uploadedPaths: string[] = [];

  for (const [index, file] of files.entries()) {
    if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
      throw new Error("JPG, PNG, WEBP, HEIC, HEIF 형식만 업로드할 수 있습니다.");
    }

    if (file.size > MAX_SINGLE_UPLOAD_BYTES) {
      throw new Error("사진 한 장은 10MB 이하만 업로드할 수 있습니다.");
    }

    const path = `${candidateId}/${Date.now()}-${index}-${safeFileName(file.name)}`;
    const buffer = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(CANDIDATE_PHOTOS_BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    uploadedPaths.push(path);
  }

  return uploadedPaths;
}

function normalizeUploadedPhotoPaths(formData: FormData) {
  return formData
    .getAll("uploadedPhotoPaths")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function normalizeCandidateStatus(value: string) {
  return CANDIDATE_STATUS_VALUES.has(value) ? value : "active";
}

function normalizeGender(value: string) {
  const cleaned = value.trim();

  if (cleaned === "남" || cleaned === "남성") {
    return "남";
  }

  if (cleaned === "여" || cleaned === "여성") {
    return "여";
  }

  return "";
}

function normalizeHeightText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || "모름";
}

function buildCounterpartLabel(candidate: {
  full_name: string;
  birth_year: number;
  region: string;
  occupation: string;
}) {
  const parts = [formatCandidateBrief(candidate)];
  if (candidate.region?.trim()) parts.push(candidate.region.trim());
  return parts.join(" · ");
}

/** viewer / admin / super_admin 변경은 `canManageRoles`(super_admin)만 서버에서 허용 */
export async function updateMembershipRole(formData: FormData) {
  const membership = await requireMembership();

  if (!canManageRoles(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const userId = String(formData.get("userId") ?? "");
  const nextRole = String(formData.get("role") ?? "viewer");
  const nextStatus = String(formData.get("status") ?? "approved");
  const supabase = await requireSupabaseClient("/admin");

  if (userId === membership.user_id) {
    redirectWithMessage("/admin", "자기 자신의 권한은 여기서 변경할 수 없습니다.");
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

  redirectWithMessage("/admin", "권한이 반영되었습니다.");
}

/** 거절 처리도 `canManageRoles`(super_admin) 전용 */
export async function rejectMembership(formData: FormData) {
  const membership = await requireMembership();

  if (!canManageRoles(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const userId = String(formData.get("userId") ?? "");
  const supabase = await requireSupabaseClient("/admin");

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

  redirectWithMessage("/admin", "가입 요청을 거절했습니다.");
}

export async function createCandidate(formData: FormData) {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const supabase = await requireSupabaseClient("/candidates/new");

  const highlightTags = cleanText(formData.get("highlightTags"))
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const submissionKey = cleanText(formData.get("submissionKey"));
  const candidateId = isUuid(submissionKey) ? submissionKey : crypto.randomUUID();
  const uploadedPaths = normalizeUploadedPhotoPaths(formData);
  let candidateInserted = false;
  let existingCandidateId: string | null = null;

  if (cleanText(formData.get("photoUploadState")) === "uploading") {
    redirect(`/candidates/new?message=${encodeURIComponent("사진 업로드가 끝난 뒤 다시 등록해주세요.")}`);
  }

  try {
    const { data: existingCandidate } = await supabase
      .from("cupid_candidates")
      .select("id")
      .eq("id", candidateId)
      .maybeSingle();

    if (existingCandidate) {
      existingCandidateId = existingCandidate.id;
    } else {
      const birthYear = Number(formData.get("birthYear") ?? 0);
      const heightText = normalizeHeightText(formData.get("heightText"));

      const payload = {
        id: candidateId,
        full_name: cleanText(formData.get("fullName")),
        birth_year: birthYear,
        height_text: heightText,
        gender: normalizeGender(cleanText(formData.get("gender"))),
        region: cleanText(formData.get("region")),
        occupation: cleanText(formData.get("occupation")),
        work_summary: cleanText(formData.get("workSummary")),
        education: cleanText(formData.get("education")),
        religion: cleanText(formData.get("religion")),
        mbti: cleanText(formData.get("mbti")) || null,
        personality_summary: cleanText(formData.get("personalitySummary")),
        ideal_type: cleanText(formData.get("idealType")),
        notes_private: cleanText(formData.get("notesPrivate")),
        status: normalizeCandidateStatus(cleanText(formData.get("status"))),
        highlight_tags: highlightTags,
        image_url: uploadedPaths[0] ?? null,
        created_by: membership.user_id,
      };

      if (!GENDER_VALUES.has(payload.gender)) {
        throw new Error("성별은 남 또는 여만 선택할 수 있습니다.");
      }

      if (!payload.region) {
        throw new Error("지역은 필수입니다.");
      }

      if (!payload.occupation) {
        throw new Error("직업은 필수입니다.");
      }

      if (!Number.isInteger(birthYear) || birthYear < 1960 || birthYear > 2010) {
        throw new Error("출생연도는 1960-2010 사이로 입력해주세요.");
      }

      const { error: candidateError } = await supabase
        .from("cupid_candidates")
        .insert(payload);

      if (candidateError) {
        const duplicateInsert =
          candidateError.code === "23505" ||
          candidateError.message.toLowerCase().includes("duplicate key");

        if (duplicateInsert) {
          throw new Error("__DUPLICATE_CANDIDATE_SUBMISSION__");
        }

        throw new Error(candidateError.message);
      }

      candidateInserted = true;

      if (uploadedPaths.length) {
        const photosPayload = uploadedPaths.map((imagePath, index) => ({
          candidate_id: candidateId,
          image_url: imagePath,
          sort_order: index,
          is_primary: index === 0,
        }));

        const { error: photosError } = await supabase
          .from("cupid_candidate_photos")
          .insert(photosPayload);

        if (photosError) {
          throw new Error(photosError.message);
        }
      }
    }
  } catch (error) {
    if (candidateInserted) {
      await supabase.from("cupid_candidates").delete().eq("id", candidateId);
    }

    if (uploadedPaths.length) {
      await supabase.storage.from(CANDIDATE_PHOTOS_BUCKET).remove(uploadedPaths);
    }

    if (
      error instanceof Error &&
      error.message === "__DUPLICATE_CANDIDATE_SUBMISSION__"
    ) {
      redirect(`/profiles/${candidateId}`);
    }

    const message =
      error instanceof Error ? error.message : "등록에 실패했습니다.";
    redirect(`/candidates/new?message=${encodeURIComponent(message)}`);
  }

  if (existingCandidateId) {
    redirect(`/profiles/${existingCandidateId}`);
  }

  redirect(`/profiles/${candidateId}`);
}

export async function updateCandidate(formData: FormData) {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const supabase = await requireSupabaseClient("/dashboard");

  const candidateId = cleanText(formData.get("candidateId"));

  if (!candidateId) {
    redirect("/dashboard?message=invalid-candidate");
  }

  const highlightTags = cleanText(formData.get("highlightTags"))
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const uploadedPaths = normalizeUploadedPhotoPaths(formData);
  const removedPhotoIds = new Set(
    formData.getAll("removedPhotoIds").map((value) => String(value)),
  );
  const primaryPhoto = cleanText(formData.get("primaryPhoto"));

  if (cleanText(formData.get("photoUploadState")) === "uploading") {
    redirect(
      `/profiles/${candidateId}/edit?message=${encodeURIComponent("사진 업로드가 끝난 뒤 다시 저장해주세요.")}`,
    );
  }

  try {
    const {
      data: existingPhotos,
      error: existingPhotosError,
    } = await supabase
      .from("cupid_candidate_photos")
      .select("id, image_url, is_primary, sort_order")
      .eq("candidate_id", candidateId)
      .order("sort_order", { ascending: true });

    if (existingPhotosError) {
      throw new Error(existingPhotosError.message);
    }

    const remainingPhotos = (existingPhotos ?? []).filter(
      (photo) => !removedPhotoIds.has(photo.id),
    );
    const selectedPrimaryExistingId = primaryPhoto.startsWith("existing:")
      ? primaryPhoto.slice("existing:".length)
      : null;
    const selectedPrimaryExisting = selectedPrimaryExistingId
      ? remainingPhotos.find((photo) => photo.id === selectedPrimaryExistingId)
      : null;

    const primaryImagePath =
      selectedPrimaryExisting?.image_url ??
      remainingPhotos.find((photo) => photo.is_primary)?.image_url ??
      remainingPhotos[0]?.image_url ??
      uploadedPaths[0] ??
      null;

    const birthYear = Number(formData.get("birthYear") ?? 0);
    const heightText = normalizeHeightText(formData.get("heightText"));
    const payload = {
      full_name: cleanText(formData.get("fullName")),
      birth_year: birthYear,
      height_text: heightText,
      gender: normalizeGender(cleanText(formData.get("gender"))),
      region: cleanText(formData.get("region")),
      occupation: cleanText(formData.get("occupation")),
      work_summary: cleanText(formData.get("workSummary")),
      education: cleanText(formData.get("education")),
      religion: cleanText(formData.get("religion")),
      mbti: cleanText(formData.get("mbti")) || null,
      personality_summary: cleanText(formData.get("personalitySummary")),
      ideal_type: cleanText(formData.get("idealType")),
      notes_private: cleanText(formData.get("notesPrivate")),
      status: normalizeCandidateStatus(cleanText(formData.get("status"))),
      highlight_tags: highlightTags,
      image_url: primaryImagePath,
    };

    if (!GENDER_VALUES.has(payload.gender)) {
      throw new Error("성별은 남 또는 여만 선택할 수 있습니다.");
    }

    if (!payload.region) {
      throw new Error("지역은 필수입니다.");
    }

    if (!payload.occupation) {
      throw new Error("직업은 필수입니다.");
    }

    if (!Number.isInteger(birthYear) || birthYear < 1960 || birthYear > 2010) {
      throw new Error("출생연도는 1960-2010 사이로 입력해주세요.");
    }

    const { error: candidateError } = await supabase
      .from("cupid_candidates")
      .update(payload)
      .eq("id", candidateId);

    if (candidateError) {
      throw new Error(candidateError.message);
    }

    if (removedPhotoIds.size) {
      const photosToRemove = (existingPhotos ?? []).filter((photo) =>
        removedPhotoIds.has(photo.id),
      );

      if (photosToRemove.length) {
        await supabase
          .from("cupid_candidate_photos")
          .delete()
          .in(
            "id",
            photosToRemove.map((photo) => photo.id),
          );

        await supabase.storage
          .from(CANDIDATE_PHOTOS_BUCKET)
          .remove(photosToRemove.map((photo) => photo.image_url));
      }
    }

    if (uploadedPaths.length) {
      const sortOrderBase = remainingPhotos.length;
      const { error: insertPhotosError } = await supabase
        .from("cupid_candidate_photos")
        .insert(
          uploadedPaths.map((imagePath, index) => ({
            candidate_id: candidateId,
            image_url: imagePath,
            sort_order: sortOrderBase + index,
            is_primary: false,
          })),
        );

      if (insertPhotosError) {
        throw new Error(insertPhotosError.message);
      }
    }

    await supabase
      .from("cupid_candidate_photos")
      .update({ is_primary: false })
      .eq("candidate_id", candidateId);

    if (primaryImagePath) {
      await supabase
        .from("cupid_candidate_photos")
        .update({ is_primary: true })
        .eq("candidate_id", candidateId)
        .eq("image_url", primaryImagePath);
    }
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from(CANDIDATE_PHOTOS_BUCKET).remove(uploadedPaths);
    }

    const message =
      error instanceof Error ? error.message : "수정에 실패했습니다.";
    redirect(
      `/profiles/${candidateId}/edit?message=${encodeURIComponent(message)}`,
    );
  }

  redirect(`/profiles/${candidateId}?message=updated`);
}

export async function updateCandidateStatus(formData: FormData) {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const supabase = await requireSupabaseClient("/dashboard");

  const candidateId = cleanText(formData.get("candidateId"));
  const status = normalizeCandidateStatus(cleanText(formData.get("status")));

  if (!candidateId) {
    redirect("/dashboard?message=invalid-candidate");
  }

  if (PAIR_REQUIRED_STATUS_VALUES.has(status)) {
    redirect(`/profiles/${candidateId}?message=${encodeURIComponent("매칭진행중/커플완성은 대시보드에서 상대 후보를 선택해 변경해주세요.")}`);
  }

  const {
    data: candidate,
    error: candidateError,
  } = await supabase
    .from("cupid_candidates")
    .select("id, paired_candidate_id")
    .eq("id", candidateId)
    .maybeSingle();

  if (candidateError || !candidate) {
    redirect(`/profiles/${candidateId}?message=${encodeURIComponent(candidateError?.message ?? "후보 정보를 찾지 못했습니다.")}`);
  }

  const pairIds = candidate.paired_candidate_id
    ? [candidateId, candidate.paired_candidate_id]
    : [candidateId];
  const payload =
    status === "active"
      ? { status, paired_candidate_id: null }
      : { status };

  const { error } = await supabase
    .from("cupid_candidates")
    .update(payload)
    .in("id", pairIds);

  if (error) {
    redirect(
      `/profiles/${candidateId}?message=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`/profiles/${candidateId}?message=status-updated`);
}

export async function moveCandidateStatus(
  candidateId: string,
  status: "active" | "matched" | "couple" | "graduated" | "archived",
) {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    return { ok: false, message: "권한이 없습니다." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { ok: false, message: "Supabase 환경변수가 없습니다." };
  }

  if (!candidateId) {
    return { ok: false, message: "후보 정보를 찾지 못했습니다." };
  }

  const normalizedStatus = normalizeCandidateStatus(status);

  if (PAIR_REQUIRED_STATUS_VALUES.has(normalizedStatus)) {
    return {
      ok: false,
      message: "매칭진행중/커플완성은 상대 후보를 먼저 선택해야 합니다.",
    };
  }

  const {
    data: candidate,
    error: candidateError,
  } = await supabase
    .from("cupid_candidates")
    .select("id, full_name, status, paired_candidate_id")
    .eq("id", candidateId)
    .maybeSingle();

  if (candidateError || !candidate) {
    return {
      ok: false,
      message: candidateError?.message ?? "후보 정보를 찾지 못했습니다.",
    };
  }

  const pairIds = candidate.paired_candidate_id
    ? [candidateId, candidate.paired_candidate_id]
    : [candidateId];
  const payload =
    normalizedStatus === "active"
      ? { status: normalizedStatus, paired_candidate_id: null }
      : { status: normalizedStatus };
  const { error } = await supabase
    .from("cupid_candidates")
    .update(payload)
    .in("id", pairIds);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, status: normalizedStatus };
}

export async function moveCandidatePairStatus(
  candidateId: string,
  counterpartCandidateId: string,
  targetStatus: "matched" | "couple",
) {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    return { ok: false, message: "권한이 없습니다." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { ok: false, message: "Supabase 환경변수가 없습니다." };
  }

  if (!candidateId || !counterpartCandidateId || candidateId === counterpartCandidateId) {
    return { ok: false, message: "상대 후보를 올바르게 선택해주세요." };
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from("cupid_candidates")
    .select("id, full_name, birth_year, region, occupation, status, paired_candidate_id")
    .in("id", [candidateId, counterpartCandidateId]);

  if (candidatesError || !candidates || candidates.length !== 2) {
    return {
      ok: false,
      message: candidatesError?.message ?? "매칭할 후보 정보를 찾지 못했습니다.",
    };
  }

  const source = candidates.find((candidate) => candidate.id === candidateId);
  const counterpart = candidates.find((candidate) => candidate.id === counterpartCandidateId);

  if (!source || !counterpart) {
    return { ok: false, message: "매칭할 후보 정보를 찾지 못했습니다." };
  }

  if (
    ["graduated", "archived"].includes(source.status) ||
    ["graduated", "archived"].includes(counterpart.status)
  ) {
    return { ok: false, message: "보조 레인 후보는 다시 적극매물로 되돌린 뒤 매칭해주세요." };
  }

  if (source.paired_candidate_id && source.paired_candidate_id !== counterpart.id) {
    return {
      ok: false,
      message: `${formatCandidateBrief(source)}은(는) 이미 다른 후보와 연결되어 있습니다.`,
    };
  }

  if (counterpart.paired_candidate_id && counterpart.paired_candidate_id !== source.id) {
    return {
      ok: false,
      message: `${formatCandidateBrief(counterpart)}은(는) 이미 다른 후보와 연결되어 있습니다.`,
    };
  }

  const { error: sourceUpdateError } = await supabase
    .from("cupid_candidates")
    .update({ status: targetStatus, paired_candidate_id: counterpart.id })
    .eq("id", source.id);

  if (sourceUpdateError) {
    return { ok: false, message: sourceUpdateError.message };
  }

  const { error: counterpartUpdateError } = await supabase
    .from("cupid_candidates")
    .update({ status: targetStatus, paired_candidate_id: source.id })
    .eq("id", counterpart.id);

  if (counterpartUpdateError) {
    return { ok: false, message: counterpartUpdateError.message };
  }

  const outcome = targetStatus === "matched" ? "dating" : "couple";
  const summary =
    targetStatus === "matched"
      ? `${formatCandidateBrief(source)}와 ${formatCandidateBrief(counterpart)}의 매칭 진행을 시작했습니다.`
      : `${formatCandidateBrief(source)}와 ${formatCandidateBrief(counterpart)}을(를) 커플완성으로 확정했습니다.`;
  const happenedOn = new Date().toISOString().slice(0, 10);
  const pairOr = buildPairMatchRecordsOrFilter(source.id, counterpart.id);

  const { data: updatedOpenRows, error: promoteError } = await supabase
    .from("cupid_match_records")
    .update({
      outcome,
      summary,
      happened_on: happenedOn,
    })
    .or(pairOr)
    .in("outcome", ONGOING_MATCH_OUTCOMES)
    .select("id");

  if (promoteError) {
    return { ok: false, message: promoteError.message };
  }

  if (!updatedOpenRows?.length) {
    // 이미 동일 outcome 레코드가 있으면 중복 삽입 방지
    const { data: existingRows } = await supabase
      .from("cupid_match_records")
      .select("id")
      .or(pairOr)
      .eq("outcome", outcome);

    if (!existingRows?.length) {
      const { error: matchRecordError } = await supabase.from("cupid_match_records").insert([
        {
          candidate_id: source.id,
          counterpart_label: buildCounterpartLabel(counterpart),
          counterpart_candidate_id: counterpart.id,
          matchmaker_id: membership.user_id,
          matchmaker_name: membership.full_name,
          outcome,
          summary,
          happened_on: happenedOn,
        },
        {
          candidate_id: counterpart.id,
          counterpart_label: buildCounterpartLabel(source),
          counterpart_candidate_id: source.id,
          matchmaker_id: membership.user_id,
          matchmaker_name: membership.full_name,
          outcome,
          summary,
          happened_on: happenedOn,
        },
      ]);

      if (matchRecordError) {
        return { ok: false, message: matchRecordError.message };
      }
    }
  }

  return {
    ok: true,
    status: targetStatus as CandidateStatus,
    pair: [source.id, counterpart.id] as const,
  };
}

export async function createMatchRecord(formData: FormData) {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const supabase = await requireSupabaseClient("/dashboard");

  const candidateId = cleanText(formData.get("candidateId"));
  const counterpartLabel = cleanText(formData.get("counterpartLabel"));
  const outcome = cleanText(formData.get("outcome"));
  const summary = cleanText(formData.get("summary"));
  const happenedOn = cleanText(formData.get("happenedOn"));
  const nextStatus = cleanText(formData.get("nextStatus"));

  if (!candidateId) {
    redirect("/dashboard?message=invalid-candidate");
  }

  const counterpartCandidateId = cleanText(formData.get("counterpartCandidateId")) || null;

  if (!counterpartLabel || !summary || !happenedOn || !MATCH_OUTCOME_VALUES.has(outcome)) {
    redirect(`/profiles/${candidateId}?message=match-invalid`);
  }

  // couple / closed는 같은 상대에게 레코드가 이미 있으면 중복 삽입 방지
  if ((outcome === "couple" || outcome === "closed") && counterpartCandidateId) {
    const { data: existing } = await supabase
      .from("cupid_match_records")
      .select("id")
      .eq("candidate_id", candidateId)
      .eq("counterpart_candidate_id", counterpartCandidateId)
      .eq("outcome", outcome)
      .maybeSingle();

    if (existing) {
      redirect(`/profiles/${candidateId}?message=${encodeURIComponent("이미 동일한 결과 기록이 존재합니다.")}`);
    }
  }

  const { error } = await supabase.from("cupid_match_records").insert({
    candidate_id: candidateId,
    counterpart_label: counterpartLabel,
    counterpart_candidate_id: counterpartCandidateId,
    matchmaker_id: membership.user_id,
    matchmaker_name: membership.full_name,
    outcome,
    summary,
    happened_on: happenedOn,
  });

  if (error) {
    redirect(
      `/profiles/${candidateId}?message=${encodeURIComponent(error.message)}`,
    );
  }

  if (nextStatus && nextStatus !== "keep") {
    await supabase
      .from("cupid_candidates")
      .update({ status: normalizeCandidateStatus(nextStatus) })
      .eq("id", candidateId);
  }

  redirect(`/profiles/${candidateId}?message=match-created`);
}

export async function deleteMatchRecord(formData: FormData) {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const supabase = await requireSupabaseClient("/dashboard");

  const candidateId = cleanText(formData.get("candidateId"));
  const recordId = cleanText(formData.get("recordId"));

  if (!candidateId || !recordId) {
    redirect("/dashboard?message=invalid-match-record");
  }

  const { error } = await supabase
    .from("cupid_match_records")
    .delete()
    .eq("id", recordId)
    .eq("candidate_id", candidateId);

  if (error) {
    redirect(
      `/profiles/${candidateId}?message=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`/profiles/${candidateId}?message=match-deleted`);
}

/**
 * 연결된 상대와의 매칭을 종료하고, 양측에 outcome=closed 기록을 남긴 뒤 페어링을 해제합니다.
 */
export async function closeMatchWithRecord(formData: FormData) {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    redirect("/dashboard?message=forbidden");
  }

  const supabase = await requireSupabaseClient("/dashboard");

  const candidateId = cleanText(formData.get("candidateId"));
  const closureReason = cleanText(formData.get("closureReason"));

  if (!candidateId) {
    redirect("/dashboard?message=invalid-candidate");
  }

  if (!closureReason) {
    redirect(`/profiles/${candidateId}?message=${encodeURIComponent("종료 사유를 입력해주세요.")}`);
  }

  const {
    data: source,
    error: sourceError,
  } = await supabase
    .from("cupid_candidates")
    .select("id, full_name, birth_year, region, occupation, paired_candidate_id")
    .eq("id", candidateId)
    .maybeSingle();

  if (sourceError || !source) {
    redirect(
      `/profiles/${candidateId}?message=${encodeURIComponent(sourceError?.message ?? "후보 정보를 찾지 못했습니다.")}`,
    );
  }

  if (!source.paired_candidate_id) {
    redirect(
      `/profiles/${candidateId}?message=${encodeURIComponent("연결된 상대가 없어 매칭 종료 기록을 남길 수 없습니다.")}`,
    );
  }

  const {
    data: counterpart,
    error: counterpartError,
  } = await supabase
    .from("cupid_candidates")
    .select("id, full_name, birth_year, region, occupation")
    .eq("id", source.paired_candidate_id)
    .maybeSingle();

  if (counterpartError || !counterpart) {
    redirect(
      `/profiles/${candidateId}?message=${encodeURIComponent(counterpartError?.message ?? "상대 후보 정보를 찾지 못했습니다.")}`,
    );
  }

  const happenedOn = new Date().toISOString().slice(0, 10);
  const pairOr = buildPairMatchRecordsOrFilter(source.id, counterpart.id);

  const { data: closedFromOpen, error: closePromoteError } = await supabase
    .from("cupid_match_records")
    .update({
      outcome: "closed",
      summary: closureReason,
      happened_on: happenedOn,
    })
    .or(pairOr)
    .in("outcome", ONGOING_MATCH_OUTCOMES)
    .select("id");

  if (closePromoteError) {
    redirect(`/profiles/${candidateId}?message=${encodeURIComponent(closePromoteError.message)}`);
  }

  if (!closedFromOpen?.length) {
    // 이미 closed 레코드가 있으면 중복 삽입 방지
    const { data: existingClosedRows } = await supabase
      .from("cupid_match_records")
      .select("id")
      .or(pairOr)
      .eq("outcome", "closed");

    if (!existingClosedRows?.length) {
      const { error: insertError } = await supabase.from("cupid_match_records").insert([
        {
          candidate_id: source.id,
          counterpart_label: buildCounterpartLabel(counterpart),
          counterpart_candidate_id: counterpart.id,
          matchmaker_id: membership.user_id,
          matchmaker_name: membership.full_name,
          outcome: "closed",
          summary: closureReason,
          happened_on: happenedOn,
        },
        {
          candidate_id: counterpart.id,
          counterpart_label: buildCounterpartLabel(source),
          counterpart_candidate_id: source.id,
          matchmaker_id: membership.user_id,
          matchmaker_name: membership.full_name,
          outcome: "closed",
          summary: closureReason,
          happened_on: happenedOn,
        },
      ]);

      if (insertError) {
        redirect(`/profiles/${candidateId}?message=${encodeURIComponent(insertError.message)}`);
      }
    }
  }

  const { error: updateError } = await supabase
    .from("cupid_candidates")
    .update({ status: "active", paired_candidate_id: null })
    .in("id", [source.id, counterpart.id]);

  if (updateError) {
    redirect(`/profiles/${candidateId}?message=${encodeURIComponent(updateError.message)}`);
  }

  redirect(`/profiles/${candidateId}?message=match-closed`);
}

/**
 * 운영 데스크 상태 변경 전용 (non-redirecting).
 * - "active" 전환 시 ONGOING + couple 레코드 모두 closed로 → 칸반 동기화
 * - "matched" 전환 시 couple 레코드를 dating으로 되돌림 → 칸반 커플완성→진행중 동기화
 */
export async function setStatusFromDesk(
  candidateId: string,
  status: string,
): Promise<{ ok: boolean; error?: string }> {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    return { ok: false, error: "권한이 없습니다." };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase 환경변수가 없습니다." };
  if (!candidateId) return { ok: false, error: "후보 정보를 찾지 못했습니다." };

  const normalizedStatus = CANDIDATE_STATUS_VALUES.has(status)
    ? (status as string)
    : "active";

  if (PAIR_REQUIRED_STATUS_VALUES.has(normalizedStatus)) {
    return {
      ok: false,
      error: "매칭진행중/커플완성은 대시보드에서 상대 후보를 선택해 변경해주세요.",
    };
  }

  const { data: candidate, error: fetchError } = await supabase
    .from("cupid_candidates")
    .select("id, status, paired_candidate_id")
    .eq("id", candidateId)
    .maybeSingle();

  if (fetchError || !candidate) {
    return { ok: false, error: fetchError?.message ?? "후보 정보를 찾지 못했습니다." };
  }

  // 커플완성 상태에서는 운영 데스크 상태 변경 차단 (대시보드 카드 이동만 허용)
  if (candidate.status === "couple") {
    return { ok: false, error: "커플완성 상태는 대시보드에서만 변경할 수 있습니다." };
  }

  const pairIds = candidate.paired_candidate_id
    ? [candidateId, candidate.paired_candidate_id]
    : [candidateId];

  const payload =
    normalizedStatus === "active"
      ? { status: normalizedStatus, paired_candidate_id: null }
      : { status: normalizedStatus };

  const { error: updateError } = await supabase
    .from("cupid_candidates")
    .update(payload)
    .in("id", pairIds);

  if (updateError) return { ok: false, error: updateError.message };

  if (candidate.paired_candidate_id) {
    const pairOr = buildPairMatchRecordsOrFilter(candidateId, candidate.paired_candidate_id);

    if (normalizedStatus === "active") {
      // 적극검토 복귀: ONGOING + couple 레코드 전부 closed 처리
      await supabase
        .from("cupid_match_records")
        .update({ outcome: "closed", summary: "상태 변경(적극검토 복귀)으로 인한 매칭 흐름 종료" })
        .or(pairOr)
        .in("outcome", [...ONGOING_MATCH_OUTCOMES, "couple"]);
    } else if (normalizedStatus === "matched") {
      // 커플완성 → 매칭진행중: couple 레코드를 dating으로 되돌려 칸반 "진행 중"으로 복귀
      await supabase
        .from("cupid_match_records")
        .update({ outcome: "dating", summary: "커플완성 취소 - 매칭 재진행" })
        .or(pairOr)
        .eq("outcome", "couple");
    }
  }

  return { ok: true };
}

/**
 * 운영 데스크에서 커플완성을 확정합니다 (non-redirecting).
 * redirect() 대신 결과를 반환 → 클라이언트가 router.push로 이동 (303 버그 제거)
 */
export async function promoteToCoupleFromDesk(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const membership = await requireMembership();

  if (!canEditCandidates(membership.role)) {
    return { ok: false, error: "권한이 없습니다." };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase 환경변수가 없습니다." };

  const candidateId = cleanText(formData.get("candidateId"));
  const counterpartId = cleanText(formData.get("counterpartId"));

  if (!candidateId || !counterpartId) {
    return { ok: false, error: "커플 확정에 필요한 정보가 없습니다." };
  }

  const { data: candidates, error: fetchError } = await supabase
    .from("cupid_candidates")
    .select("id, full_name, birth_year, region, occupation, paired_candidate_id")
    .in("id", [candidateId, counterpartId]);

  if (fetchError || !candidates || candidates.length !== 2) {
    return { ok: false, error: fetchError?.message ?? "후보 정보를 찾지 못했습니다." };
  }

  const source = candidates.find((c) => c.id === candidateId)!;
  const counterpart = candidates.find((c) => c.id === counterpartId)!;

  const { error: sourceStatusError } = await supabase
    .from("cupid_candidates")
    .update({ status: "couple", paired_candidate_id: counterpart.id })
    .eq("id", source.id);

  if (sourceStatusError) {
    return { ok: false, error: sourceStatusError.message };
  }

  const { error: counterpartStatusError } = await supabase
    .from("cupid_candidates")
    .update({ status: "couple", paired_candidate_id: source.id })
    .eq("id", counterpart.id);

  if (counterpartStatusError) {
    return { ok: false, error: counterpartStatusError.message };
  }

  const happenedOn = new Date().toISOString().slice(0, 10);
  const summary = `${formatCandidateBrief(source)}와 ${formatCandidateBrief(counterpart)}을(를) 커플완성으로 확정했습니다.`;
  const pairOr = buildPairMatchRecordsOrFilter(source.id, counterpart.id);

  const { data: updatedRows } = await supabase
    .from("cupid_match_records")
    .update({ outcome: "couple", summary, happened_on: happenedOn })
    .or(pairOr)
    .in("outcome", ONGOING_MATCH_OUTCOMES)
    .select("id");

  if (!updatedRows?.length) {
    const { data: existingCoupleRows } = await supabase
      .from("cupid_match_records")
      .select("id")
      .or(pairOr)
      .eq("outcome", "couple");

    if (!existingCoupleRows?.length) {
      await supabase.from("cupid_match_records").insert([
        {
          candidate_id: source.id,
          counterpart_label: buildCounterpartLabel(counterpart),
          counterpart_candidate_id: counterpart.id,
          matchmaker_id: membership.user_id,
          matchmaker_name: membership.full_name,
          outcome: "couple",
          summary,
          happened_on: happenedOn,
        },
        {
          candidate_id: counterpart.id,
          counterpart_label: buildCounterpartLabel(source),
          counterpart_candidate_id: source.id,
          matchmaker_id: membership.user_id,
          matchmaker_name: membership.full_name,
          outcome: "couple",
          summary,
          happened_on: happenedOn,
        },
      ]);
    }
  }

  return { ok: true };
}
