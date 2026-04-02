import Link from "next/link";
import { GenderToggleField } from "@/components/gender-toggle-field";
import { PhotoUploadField } from "@/components/photo-upload-field";
import { createCandidate } from "@/lib/admin-actions";

type NewCandidatePageProps = {
  searchParams: Promise<{ message?: string }>;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[0.96rem] font-bold text-[#725761]">{children}</span>;
}

export default async function NewCandidatePage({ searchParams }: NewCandidatePageProps) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f2_0%,#fff3ec_42%,#fffaf6_100%)] text-[#24161c]">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 rounded-[34px] border border-[#ead8cf] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,244,239,0.96))] p-6 shadow-[0_24px_70px_rgba(143,95,89,0.12)] sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Candidate Studio</p>
            <h1 className="mt-4 text-[clamp(2.2rem,9vw,4.2rem)] font-semibold tracking-[-0.08em] text-[#24161c]">새 매물 등록</h1>
            <p className="mt-4 max-w-[60ch] text-[15px] leading-7 text-[#6d5961] sm:text-base">
              admin과 super_admin은 기본 프로필, 태그, 사진 갤러리까지 함께 등록할 수 있습니다.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24]" href="/dashboard">
              대시보드
            </Link>
            <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24]" href="/admin">
              승인 관리
            </Link>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-[#f0ddd2] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#8a6b74]">
            {message}
          </div>
        ) : null}

        <form action={createCandidate} className="grid gap-5">
          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-[30px] border border-[#ead8cf] bg-white/90 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Basic Info</p>
              <h2 className="mt-3 text-[clamp(1.6rem,7vw,2.4rem)] font-semibold tracking-[-0.05em] text-[#24161c]">기본 프로필</h2>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <FieldLabel>이름</FieldLabel>
                  <input name="fullName" placeholder="김서연" required className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>출생연도</FieldLabel>
                  <input name="birthYear" type="number" placeholder="1994" required className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <GenderToggleField name="gender" required />
                <label className="grid gap-2">
                  <FieldLabel>지역</FieldLabel>
                  <input name="region" placeholder="서울" className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>직업</FieldLabel>
                  <input name="occupation" placeholder="기획자" required className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>직장 / 직무</FieldLabel>
                  <input name="workSummary" placeholder="INNOVATE · 서비스 기획" className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>학력</FieldLabel>
                  <input name="education" placeholder="연세대학교" className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>종교</FieldLabel>
                  <input name="religion" placeholder="무교" className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>MBTI</FieldLabel>
                  <input name="mbti" placeholder="ENFJ" className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>상태</FieldLabel>
                  <input name="status" placeholder="active" defaultValue="active" className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
              </div>
            </article>

            <article className="rounded-[30px] border border-[#ead8cf] bg-white/90 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Story & Photos</p>
              <h2 className="mt-3 text-[clamp(1.6rem,7vw,2.4rem)] font-semibold tracking-[-0.05em] text-[#24161c]">소개 판단용 정보</h2>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <FieldLabel>인상 요약</FieldLabel>
                  <textarea name="personalitySummary" rows={4} placeholder="차분하고 센스가 있으며..." className="rounded-[22px] border border-[#ead8cf] bg-white/95 px-4 py-3 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>이상형</FieldLabel>
                  <textarea name="idealType" rows={3} placeholder="성실하고 유머가 있으며..." className="rounded-[22px] border border-[#ead8cf] bg-white/95 px-4 py-3 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>비공개 메모</FieldLabel>
                  <textarea name="notesPrivate" rows={4} placeholder="주말 취향, 비흡연 여부 등" className="rounded-[22px] border border-[#ead8cf] bg-white/95 px-4 py-3 text-sm font-semibold text-[#37232b]" />
                </label>
                <label className="grid gap-2">
                  <FieldLabel>태그</FieldLabel>
                  <input name="highlightTags" placeholder="대화잘함, 서울거주, 비흡연" className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]" />
                </label>
                <PhotoUploadField />
                <button className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-6 text-sm font-semibold text-[#2b1b11]" type="submit">
                  매물 등록하기
                </button>
              </div>
              <div className="mt-4 rounded-2xl border border-[#f0ddd2] bg-[#fff8f3] px-4 py-4 text-sm leading-6 text-[#8a6b74]">
                이름, 출생연도, 성별, 직업은 필수입니다. 사진은 private bucket에 저장되고, 상세 화면에서는 signed URL로만 열립니다.
              </div>
            </article>
          </section>
        </form>
      </div>
    </main>
  );
}
