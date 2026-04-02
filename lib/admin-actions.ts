"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

function buildCounterpartLabel(candidate: {
  full_name: string;
  birth_year: number;
  region: string;
  occupation: string;
}) {
  return [
    candidate.full_name,
    `${candidate.birth_year}년생`,
    candidate.region || null,
    candidate.occupation || null,
  ]
    .filter(Boolean)
    .join(" · ");
}

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

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/pending");
  redirectWithMessage("/admin", "권한이 반영되었습니다.");
}

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

  revalidatePath("/admin");
  revalidatePath("/pending");
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

      const payload = {
        id: candidateId,
        full_name: cleanText(formData.get("fullName")),
        birth_year: birthYear,
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

      if (!payload.full_name) {
        throw new Error("이름은 필수입니다.");
      }

      if (!GENDER_VALUES.has(payload.gender)) {
        throw new Error("성별은 남 또는 여만 선택할 수 있습니다.");
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
      revalidatePath("/dashboard");
      redirect(`/profiles/${candidateId}`);
    }

    const message =
      error instanceof Error ? error.message : "등록에 실패했습니다.";
    redirect(`/candidates/new?message=${encodeURIComponent(message)}`);
  }

  if (existingCandidateId) {
    revalidatePath("/dashboard");
    revalidatePath(`/profiles/${existingCandidateId}`);
    redirect(`/profiles/${existingCandidateId}`);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/profiles/${candidateId}`);
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
    const payload = {
      full_name: cleanText(formData.get("fullName")),
      birth_year: birthYear,
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

    if (!payload.full_name) {
      throw new Error("이름은 필수입니다.");
    }

    if (!GENDER_VALUES.has(payload.gender)) {
      throw new Error("성별은 남 또는 여만 선택할 수 있습니다.");
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

  revalidatePath("/dashboard");
  revalidatePath(`/profiles/${candidateId}`);
  revalidatePath(`/profiles/${candidateId}/edit`);
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

  revalidatePath("/dashboard");
  revalidatePath(`/profiles/${candidateId}`);
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

  revalidatePath("/dashboard");
  revalidatePath(`/profiles/${candidateId}`);

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
      message: `${source.full_name}은 이미 다른 후보와 연결되어 있습니다.`,
    };
  }

  if (counterpart.paired_candidate_id && counterpart.paired_candidate_id !== source.id) {
    return {
      ok: false,
      message: `${counterpart.full_name}은 이미 다른 후보와 연결되어 있습니다.`,
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
      ? `${source.full_name}와 ${counterpart.full_name}의 매칭 진행을 시작했습니다.`
      : `${source.full_name}와 ${counterpart.full_name}을 커플완성으로 확정했습니다.`;
  const happenedOn = new Date().toISOString().slice(0, 10);

  const { error: matchRecordError } = await supabase
    .from("cupid_match_records")
    .insert([
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

  revalidatePath("/dashboard");
  revalidatePath(`/profiles/${source.id}`);
  revalidatePath(`/profiles/${counterpart.id}`);

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

  if (!counterpartLabel || !summary || !happenedOn || !MATCH_OUTCOME_VALUES.has(outcome)) {
    redirect(`/profiles/${candidateId}?message=match-invalid`);
  }

  const { error } = await supabase.from("cupid_match_records").insert({
    candidate_id: candidateId,
    counterpart_label: counterpartLabel,
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

  revalidatePath("/dashboard");
  revalidatePath(`/profiles/${candidateId}`);
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

  revalidatePath("/dashboard");
  revalidatePath(`/profiles/${candidateId}`);
  redirect(`/profiles/${candidateId}?message=match-deleted`);
}
