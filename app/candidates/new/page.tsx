import Link from "next/link";
import { createCandidate } from "@/lib/admin-actions";

type NewCandidatePageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function NewCandidatePage({ searchParams }: NewCandidatePageProps) {
  const { message } = await searchParams;

  return (
    <main className="pageFrame">
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
                <label>
                  성별
                  <input name="gender" placeholder="여성" required />
                </label>
                <label>
                  지역
                  <input name="region" placeholder="서울" required />
                </label>
                <label>
                  직업
                  <input name="occupation" placeholder="기획자" required />
                </label>
                <label>
                  직장 / 직무
                  <input name="workSummary" placeholder="INNOVATE · 서비스 기획" required />
                </label>
                <label>
                  학력
                  <input name="education" placeholder="연세대학교" required />
                </label>
                <label>
                  종교
                  <input name="religion" placeholder="무교" required />
                </label>
                <label>
                  MBTI
                  <input name="mbti" placeholder="ENFJ" />
                </label>
                <label>
                  상태
                  <input name="status" placeholder="active" defaultValue="active" required />
                </label>
              </div>
            </article>

            <article className="detailPanel">
              <p className="eyebrow">Story & Photos</p>
              <h3>소개 판단용 정보</h3>
              <div className="authForm">
                <label>
                  인상 요약
                  <textarea name="personalitySummary" rows={4} placeholder="차분하고 센스가 있으며..." required />
                </label>
                <label>
                  이상형
                  <textarea name="idealType" rows={3} placeholder="성실하고 유머가 있으며..." required />
                </label>
                <label>
                  비공개 메모
                  <textarea name="notesPrivate" rows={4} placeholder="주말 취향, 비흡연 여부 등" required />
                </label>
                <label>
                  태그
                  <input name="highlightTags" placeholder="대화잘함, 서울거주, 비흡연" />
                </label>
                <label>
                  사진 URL 목록
                  <textarea
                    name="photoUrls"
                    rows={6}
                    placeholder={"https://.../photo-1.jpg\nhttps://.../photo-2.jpg"}
                  />
                </label>
                <button className="primaryButton" type="submit">
                  매물 등록하기
                </button>
              </div>
              <div className="authHint">
                사진 URL은 한 줄에 하나씩 넣으면 첫 줄이 대표 이미지, 나머지는 상세 갤러리로 등록됩니다.
              </div>
            </article>
          </section>
        </form>
      </div>
    </main>
  );
}
