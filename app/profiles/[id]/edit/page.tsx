import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FormSubmitButton } from "@/components/form-submit-button";
import { GlobalNav } from "@/components/global-nav";
import { GenderToggleField } from "@/components/gender-toggle-field";
import { PhotoUploadField } from "@/components/photo-upload-field";
import { getCandidateById, getCandidatePhotos } from "@/lib/data";
import { updateCandidate } from "@/lib/admin-actions";
import { requireMembershipRole } from "@/lib/permissions";

type EditCandidatePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="flex flex-wrap items-center gap-2 text-[0.96rem] font-bold text-[#725761]">
      <span>{children}</span>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          required ? "bg-[#fff1e6] text-[#b46d59]" : "bg-[#f7f0eb] text-[#8b6a63]"
        }`}
      >
        {required ? "[필수]" : "[선택]"}
      </span>
    </span>
  );
}

export default async function EditCandidatePage({ params, searchParams }: EditCandidatePageProps) {
  const membership = await requireMembershipRole(["admin", "super_admin"]);
  const { id } = await params;
  const { message } = await searchParams;
  const candidate = await getCandidateById(id);

  if (!candidate) {
    notFound();
  }

  const photos = await getCandidatePhotos(id);

  return (
    <>
      <GlobalNav membership={membership} active="profile" />
      <main className="min-h-screen bg-slate-50 text-[#24161c]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-8 pb-10 pt-24 lg:px-12">
        <section className="flex flex-col gap-4 rounded-[34px] border border-[#ead8cf] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,244,239,0.96))] p-6 shadow-[0_24px_70px_rgba(143,95,89,0.12)] sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Candidate Edit</p>
            <h1 className="mt-4 text-[clamp(2.2rem,9vw,4.2rem)] font-semibold tracking-[-0.08em] text-[#24161c]">매물 수정</h1>
            <p className="mt-4 max-w-[60ch] text-[15px] leading-7 text-[#6d5961] sm:text-base">
              상세페이지로 돌아가지 않고도 기본 정보, 사진, 상태를 한 번에 정리합니다.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24]" href={`/profiles/${candidate.id}`}>
              상세로 돌아가기
            </Link>
            <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24]" href="/dashboard">
              대시보드
            </Link>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-[#f0ddd2] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#8a6b74]">
            {message}
          </div>
        ) : null}

        <form action={updateCandidate} className="grid gap-5">
          <input type="hidden" name="candidateId" value={candidate.id} />
          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-[30px] border border-[#ead8cf] bg-white/90 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Basic Info</p>
              <h2 className="mt-3 text-[clamp(1.6rem,7vw,2.4rem)] font-semibold tracking-[-0.05em] text-[#24161c]">기본 프로필</h2>
              <p className="mt-3 text-sm leading-6 text-[#8b6a63]">
                필수 입력: 이름, 지역, 출생연도, 성별, 직업
              </p>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <FieldLabel required>이름</FieldLabel>
                  <input name="fullName" defaultValue={candidate.full_name} required className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel required>출생연도</FieldLabel>
                  <input name="birthYear" type="number" defaultValue={candidate.birth_year} required className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>키</FieldLabel>
                  <input name="heightText" defaultValue={candidate.height_text} className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <GenderToggleField name="gender" defaultValue={candidate.gender} required />
                <label className="grid gap-2">
                  <FieldLabel required>지역</FieldLabel>
                  <input name="region" defaultValue={candidate.region} required className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel required>직업</FieldLabel>
                  <input name="occupation" defaultValue={candidate.occupation} required className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>직장 / 직무</FieldLabel>
                  <input name="workSummary" defaultValue={candidate.work_summary} className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>학력</FieldLabel>
                  <input name="education" defaultValue={candidate.education} className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>종교</FieldLabel>
                  <input name="religion" defaultValue={candidate.religion} className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>MBTI</FieldLabel>
                  <input name="mbti" defaultValue={candidate.mbti ?? ""} className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>상태</FieldLabel>
                  <select name="status" defaultValue={candidate.status} className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]">
                    <option value="active">active</option>
                    <option value="matched">matched</option>
                    <option value="couple">couple</option>
                    <option value="graduated">graduated</option>
                    <option value="archived">archived</option>
                  </select>
                </label>
              </div>
            </article>

            <article className="rounded-[30px] border border-[#ead8cf] bg-white/90 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Story & Photos</p>
              <h2 className="mt-3 text-[clamp(1.6rem,7vw,2.4rem)] font-semibold tracking-[-0.05em] text-[#24161c]">소개 판단용 정보</h2>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <FieldLabel>인상 요약</FieldLabel>
                  <textarea name="personalitySummary" rows={4} defaultValue={candidate.personality_summary} className="rounded-[22px] border border-[#ead8cf] bg-white/95 px-4 py-3 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>이상형</FieldLabel>
                  <textarea name="idealType" rows={3} defaultValue={candidate.ideal_type} className="rounded-[22px] border border-[#ead8cf] bg-white/95 px-4 py-3 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>비공개 메모</FieldLabel>
                  <textarea name="notesPrivate" rows={4} defaultValue={candidate.notes_private} className="rounded-[22px] border border-[#ead8cf] bg-white/95 px-4 py-3 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>태그</FieldLabel>
                  <input name="highlightTags" defaultValue={candidate.highlight_tags.join(", ")} className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <PhotoUploadField storageFolderId={candidate.id} />
                <FormSubmitButton
                  idleLabel="수정 내용 저장"
                  pendingLabel="저장 중..."
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-6 text-sm font-semibold text-[#2b1b11] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div className="mt-4 rounded-2xl border border-[#f0ddd2] bg-[#fff8f3] px-4 py-4 text-sm leading-6 text-[#8a6b74]">
                이름, 지역, 출생연도, 성별, 직업은 필수입니다. 나머지는 선택 입력입니다.
              </div>
            </article>
          </section>

          <section className="rounded-[30px] border border-[#ead8cf] bg-white/90 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Existing Photos</p>
            <h2 className="mt-3 text-[clamp(1.6rem,7vw,2.4rem)] font-semibold tracking-[-0.05em] text-[#24161c]">현재 등록된 사진 관리</h2>
            <p className="mt-3 text-[15px] leading-7 text-[#6d5961] sm:text-base">
              대표 사진을 바꾸거나, 필요 없는 사진을 제거할 수 있습니다.
            </p>
            {photos.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {photos.map((photo) => (
                  <article key={photo.id} className="grid gap-3 rounded-[24px] border border-[#ead8cf] bg-[#fffaf7] p-4">
                    <div className="relative min-h-[220px] overflow-hidden rounded-[20px] bg-[#fff3ec]">
                      <Image
                        src={photo.image_url}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="grid gap-3 text-sm font-medium text-[#5f4951]">
                      <label className="flex items-center gap-3">
                        <input type="radio" name="primaryPhoto" value={`existing:${photo.id}`} defaultChecked={photo.is_primary} />
                        대표 사진으로 유지
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" name="removedPhotoIds" value={photo.id} />
                        이 사진 제거
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-[#f0ddd2] bg-[#fff8f3] px-5 py-6 text-center text-[#8a6b74]">
                아직 등록된 사진이 없습니다.
              </div>
            )}
          </section>
        </form>
      </div>
      </main>
    </>
  );
}
