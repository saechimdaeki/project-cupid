import { notFound } from "next/navigation";
import { PersonPreview } from "@/components/person-preview";
import { StatusBadge } from "@/components/status-badge";
import { getCandidateById, getCandidatePhotos, getMatchRecords } from "@/lib/data";

type CandidateDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const { id } = await params;
  const candidate = await getCandidateById(id);

  if (!candidate) {
    notFound();
  }

  const [history, photos] = await Promise.all([
    getMatchRecords(candidate.id),
    getCandidatePhotos(candidate.id),
  ]);

  return (
    <main className="pageFrame">
      <div className="landingWrap">
        <section className="detailHero">
          <article className="detailPanel portraitPanel">
            <PersonPreview
              imageUrl={candidate.image_url}
              gender={candidate.gender}
              className="portraitPreview"
              size="lg"
            />
            <div className="portraitLabel">
              <p className="eyebrow">{candidate.region}</p>
              <h1 className="detailTitle">{candidate.full_name}</h1>
              <p className="heroSubtitle">{candidate.personality_summary}</p>
              <div className="detailInfoGrid">
                <span className="infoPill">{candidate.birth_year}년생</span>
                <span className="infoPill">{candidate.gender}</span>
                <span className="infoPill">{candidate.occupation}</span>
                <span className="infoPill">{candidate.work_summary}</span>
                <span className="infoPill">{candidate.religion}</span>
              </div>
            </div>
          </article>

          <article className="detailPanel">
            <p className="eyebrow">Status</p>
            <div className="cardTop">
              <h3>현재 운영 상태</h3>
              <StatusBadge tone={candidate.status === "couple" || candidate.status === "graduated" ? "success" : candidate.status === "matched" ? "warning" : "default"}>
                {candidate.status}
              </StatusBadge>
            </div>
            <p className="pageMeta">
              이 상세 페이지는 조건 나열보다 실제 소개 판단에 필요한 정보와 이력을 더 빨리 읽게 만드는 데 집중합니다.
            </p>

            <div className="sectionBlock">
              <p className="eyebrow">Ideal Type</p>
              <p>{candidate.ideal_type}</p>
            </div>

            <div className="sectionBlock">
              <p className="eyebrow">Private Notes</p>
              <p>{candidate.notes_private}</p>
            </div>

            <div className="tagRow">
              {candidate.highlight_tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        </section>

        <section className="detailColumns">
          <article className="detailPanel">
            <p className="eyebrow">Profile Read</p>
            <h3>기본 조건과 인상</h3>
            <div className="timelineList">
              <div className="timelineItem">
                <h4>직장 / 직무</h4>
                <p>{candidate.work_summary}</p>
              </div>
              <div className="timelineItem">
                <h4>학력</h4>
                <p>{candidate.education}</p>
              </div>
              <div className="timelineItem">
                <h4>MBTI</h4>
                <p>{candidate.mbti ?? "미기재"}</p>
              </div>
              <div className="timelineItem">
                <h4>요약 인상</h4>
                <p>{candidate.personality_summary}</p>
              </div>
            </div>
          </article>

          <article className="detailPanel">
            <p className="eyebrow">Photo Gallery</p>
            <h3>등록된 사진</h3>
            <div className="photoGallery">
              {photos.length ? (
                photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="galleryPhoto"
                    style={{ backgroundImage: `url(${photo.image_url})` }}
                  />
                ))
              ) : (
                <div className="emptyState">등록된 사진이 없습니다.</div>
              )}
            </div>
          </article>

          <article className="detailPanel">
            <p className="eyebrow">Match History</p>
            <h3>이 매물의 연결 기록</h3>
            <div className="timelineList">
              {history.length ? (
                history.map((record) => (
                  <article key={record.id} className="timelineItem">
                    <div className="cardTop">
                      <h4>{record.counterpart_label}</h4>
                      <StatusBadge tone={record.outcome === "couple" ? "success" : "warning"}>
                        {record.outcome}
                      </StatusBadge>
                    </div>
                    <p>{record.summary}</p>
                    <div className="historyMeta">
                      <span>{record.matchmaker_name}</span>
                      <span>{record.happened_on}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="emptyState">아직 기록된 매칭 이력이 없습니다.</div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
