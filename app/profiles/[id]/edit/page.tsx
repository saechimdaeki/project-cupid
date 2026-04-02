import Link from "next/link";
import { notFound } from "next/navigation";
import { GenderToggleField } from "@/components/gender-toggle-field";
import { PhotoUploadField } from "@/components/photo-upload-field";
import { updateCandidate } from "@/lib/admin-actions";
import { getCandidateById, getCandidatePhotos } from "@/lib/data";

type EditCandidatePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

export default async function EditCandidatePage({
  params,
  searchParams,
}: EditCandidatePageProps) {
  const { id } = await params;
  const { message } = await searchParams;
  const candidate = await getCandidateById(id);

  if (!candidate) {
    notFound();
  }

  const photos = await getCandidatePhotos(id);

  return (
    <main className="pageFrame workspacePage">
      <div className="landingWrap">
        <div className="pageHeader">
          <div>
            <p className="eyebrow">Candidate Edit</p>
            <h1 className="pageTitle">매물 수정</h1>
            <p className="pageMeta">
              상세페이지로 돌아가지 않고도 기본 정보, 사진, 상태를 한 번에 정리합니다.
            </p>
          </div>
          <div className="heroActions">
            <Link className="ghostButton" href={`/profiles/${candidate.id}`}>
              상세로 돌아가기
            </Link>
            <Link className="ghostButton" href="/dashboard">
              대시보드
            </Link>
          </div>
        </div>

        {message ? <div className="notice">{message}</div> : null}

        <form action={updateCandidate}>
          <input type="hidden" name="candidateId" value={candidate.id} />

          <section className="detailColumns">
            <article className="detailPanel">
              <p className="eyebrow">Basic Info</p>
              <h3>기본 프로필</h3>
              <div className="authForm">
                <label>
                  이름
                  <input name="fullName" defaultValue={candidate.full_name} required />
                </label>
                <label>
                  출생연도
                  <input
                    name="birthYear"
                    type="number"
                    defaultValue={candidate.birth_year}
                    required
                  />
                </label>
                <GenderToggleField
                  name="gender"
                  defaultValue={candidate.gender}
                  required
                />
                <label>
                  지역
                  <input name="region" defaultValue={candidate.region} />
                </label>
                <label>
                  직업
                  <input name="occupation" defaultValue={candidate.occupation} required />
                </label>
                <label>
                  직장 / 직무
                  <input name="workSummary" defaultValue={candidate.work_summary} />
                </label>
                <label>
                  학력
                  <input name="education" defaultValue={candidate.education} />
                </label>
                <label>
                  종교
                  <input name="religion" defaultValue={candidate.religion} />
                </label>
                <label>
                  MBTI
                  <input name="mbti" defaultValue={candidate.mbti ?? ""} />
                </label>
                <label>
                  상태
                  <select name="status" defaultValue={candidate.status}>
                    <option value="active">active</option>
                    <option value="matched">matched</option>
                    <option value="couple">couple</option>
                    <option value="graduated">graduated</option>
                    <option value="archived">archived</option>
                  </select>
                </label>
              </div>
            </article>

            <article className="detailPanel">
              <p className="eyebrow">Story & Photos</p>
              <h3>소개 판단용 정보</h3>
              <div className="authForm">
                <label>
                  인상 요약
                  <textarea
                    name="personalitySummary"
                    rows={4}
                    defaultValue={candidate.personality_summary}
                  />
                </label>
                <label>
                  이상형
                  <textarea
                    name="idealType"
                    rows={3}
                    defaultValue={candidate.ideal_type}
                  />
                </label>
                <label>
                  비공개 메모
                  <textarea
                    name="notesPrivate"
                    rows={4}
                    defaultValue={candidate.notes_private}
                  />
                </label>
                <label>
                  태그
                  <input
                    name="highlightTags"
                    defaultValue={candidate.highlight_tags.join(", ")}
                  />
                </label>
                <PhotoUploadField />
                <button className="primaryButton" type="submit">
                  수정 내용 저장
                </button>
              </div>
            </article>
          </section>

          <section className="sectionBlock">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">Existing Photos</p>
                <h2 className="pageTitle">현재 등록된 사진 관리</h2>
                <p className="pageMeta">
                  대표 사진을 바꾸거나, 필요 없는 사진을 제거할 수 있습니다. 대표를 선택하지 않으면 현재 대표 또는 첫 사진이 유지됩니다.
                </p>
              </div>
            </div>

            {photos.length ? (
              <div className="existingPhotoGrid">
                {photos.map((photo) => (
                  <article key={photo.id} className="existingPhotoCard">
                    <div
                      className="existingPhotoPreview"
                      style={{ backgroundImage: `url(${photo.image_url})` }}
                    />
                    <div className="existingPhotoMeta">
                      <label className="existingPhotoOption">
                        <input
                          type="radio"
                          name="primaryPhoto"
                          value={`existing:${photo.id}`}
                          defaultChecked={photo.is_primary}
                        />
                        대표 사진으로 유지
                      </label>
                      <label className="existingPhotoOption">
                        <input
                          type="checkbox"
                          name="removedPhotoIds"
                          value={photo.id}
                        />
                        이 사진 제거
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="emptyState">아직 등록된 사진이 없습니다.</div>
            )}
          </section>
        </form>
      </div>
    </main>
  );
}
