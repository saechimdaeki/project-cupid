import Link from "next/link";
import { GenderToggleField } from "@/components/gender-toggle-field";
import { PhotoUploadField } from "@/components/photo-upload-field";
import { createCandidate } from "@/lib/admin-actions";

type NewCandidatePageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function NewCandidatePage({ searchParams }: NewCandidatePageProps) {
  const { message } = await searchParams;

  return (
    <main className="pageFrame workspacePage">
      <div className="landingWrap">
        <div className="pageHeader">
          <div>
            <p className="eyebrow">Candidate Studio</p>
            <h1 className="pageTitle">새 매물 등록</h1>
            <p className="pageMeta">admin과 super_admin은 기본 프로필, 태그, 사진 갤러리 URL까지 함께 등록할 수 있습니다.</p>
          </div>
          <div className="heroActions">
            <Link className="ghostButton" href="/dashboard">
              대시보드
            </Link>
            <Link className="ghostButton" href="/admin">
              승인 관리
            </Link>
          </div>
        </div>

        {message ? <div className="notice">{message}</div> : null}

        <form action={createCandidate}>
          <section className="detailColumns">
            <article className="detailPanel">
              <p className="eyebrow">Basic Info</p>
              <h3>기본 프로필</h3>
              <div className="authForm">
                <label>
                  이름
                  <input name="fullName" placeholder="김서연" required />
                </label>
                <label>
                  출생연도
                  <input name="birthYear" type="number" placeholder="1994" required />
                </label>
                <GenderToggleField name="gender" required />
                <label>
                  지역
                  <input name="region" placeholder="서울" />
                </label>
                <label>
                  직업
                  <input name="occupation" placeholder="기획자" required />
                </label>
                <label>
                  직장 / 직무
                  <input name="workSummary" placeholder="INNOVATE · 서비스 기획" />
                </label>
                <label>
                  학력
                  <input name="education" placeholder="연세대학교" />
                </label>
                <label>
                  종교
                  <input name="religion" placeholder="무교" />
                </label>
                <label>
                  MBTI
                  <input name="mbti" placeholder="ENFJ" />
                </label>
                <label>
                  상태
                  <input name="status" placeholder="active" defaultValue="active" />
                </label>
              </div>
            </article>

            <article className="detailPanel">
              <p className="eyebrow">Story & Photos</p>
              <h3>소개 판단용 정보</h3>
              <div className="authForm">
                <label>
                  인상 요약
                  <textarea name="personalitySummary" rows={4} placeholder="차분하고 센스가 있으며..." />
                </label>
                <label>
                  이상형
                  <textarea name="idealType" rows={3} placeholder="성실하고 유머가 있으며..." />
                </label>
                <label>
                  비공개 메모
                  <textarea name="notesPrivate" rows={4} placeholder="주말 취향, 비흡연 여부 등" />
                </label>
                <label>
                  태그
                  <input name="highlightTags" placeholder="대화잘함, 서울거주, 비흡연" />
                </label>
                <PhotoUploadField />
                <button className="primaryButton" type="submit">
                  매물 등록하기
                </button>
              </div>
              <div className="authHint">
                이름, 출생연도, 성별, 직업은 필수입니다. 사진은 private bucket에 저장되고,
                상세 화면에서는 signed URL로만 열립니다. 여러 장을 첨부하면 첫 사진이 대표 이미지로 등록됩니다.
              </div>
            </article>
          </section>
        </form>
      </div>
    </main>
  );
}
