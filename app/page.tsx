import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { LandingScene } from "@/components/landing-scene";
import { SplashIntro } from "@/components/splash-intro";
import { mockCandidates } from "@/lib/mock-data";
import { canManageRoles, getCurrentMembership } from "@/lib/permissions";

export default async function HomePage() {
  const membership = await getCurrentMembership();
  const previewCandidates = mockCandidates.slice(0, 2);
  const leftCandidate = previewCandidates[0];
  const rightCandidate = previewCandidates[1] ?? previewCandidates[0];

  return (
    <main className="pageFrame landingPage">
      <SplashIntro />
      <div className="landingWrap">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={`petal-${index}`}
            className={`blossomPetal petal${(index % 5) + 1}`}
          />
        ))}
        <div className="pageGlow glowLeft" />
        <div className="pageGlow glowRight" />
        <div className="pageTexture textureDots" />
        <div className="pageTexture textureGrid" />
        <header className="topbar">
          <div className="brandLockup">
            <div className="brandMark">C</div>
            <div className="brandText">
              <strong>Project Cupid</strong>
              <span>Private Matchmaking Workspace</span>
            </div>
          </div>
          <div className="topbarCluster">
            {membership ? (
              <AccountPanel membership={membership} />
            ) : (
              <div className="heroActions topbarButtons">
                <Link className="ghostButton" href="/login">
                  회원가입 / 로그인
                </Link>
                <Link className="primaryButton" href="/dashboard">
                  보드 열기
                </Link>
              </div>
            )}
          </div>
        </header>

        <section className="heroGrid heroFullBleed">
          <article className="heroCard heroPrimary">
            <div className="heroDoodle doodleHeart">♥</div>
            <div className="heroDoodle doodleSpark">✦</div>
            <div className="heroDoodle doodleRing" />
            <div className="heroDoodle doodleMiniHeart">♥</div>
            <p className="eyebrow">Private Matchmaking Studio</p>
            <h1 className="heroTitle">
              좋은 인연을
              <br />
              잇습니다
            </h1>
            <p className="heroSubtitle">
              승인된 사람만 들어와 사진, 이력, 만남의 흐름을 함께 보며 소개를 설계하는
              프라이빗 매칭 스튜디오입니다.
            </p>

            <div className="heroSignals">
              <span className="signalPill">비공개 매칭 보드</span>
              <span className="signalPill">사진 · 이력 · 온도 기록</span>
              <span className="signalPill">admin · super_admin 등록</span>
            </div>

            <div className="heroStats">
              <div className="statTile">
                <p className="eyebrow">Access Model</p>
                <strong>3단계 권한</strong>
                <span>viewer, admin, super_admin으로 분리</span>
              </div>
              <div className="statTile">
                <p className="eyebrow">Candidate Photos</p>
                <strong>{mockCandidates.length}건</strong>
                <span>대표 사진과 상세 갤러리를 함께 관리</span>
              </div>
              <div className="statTile">
                <p className="eyebrow">Trusted Flow</p>
                <strong>승인 기반 운영</strong>
                <span>누가 어디까지 볼지 화면 단위로 제어</span>
              </div>
            </div>

            <div className="heroActions">
              {membership ? (
                <>
                  <Link className="primaryButton" href="/dashboard">
                    대시보드로 이동
                  </Link>
                  <Link
                    className="ghostButton"
                    href={canManageRoles(membership.role) ? "/admin" : "/dashboard?filter=active"}
                  >
                    {canManageRoles(membership.role) ? "권한 관리" : "활성 매물 보기"}
                  </Link>
                </>
              ) : (
                <>
                  <Link className="primaryButton" href="/login">
                    회원가입 / 로그인
                  </Link>
                  <Link className="ghostButton" href="/dashboard">
                    둘러보기
                  </Link>
                </>
              )}
            </div>
          </article>

          <aside className="loveStage">
            <LandingScene leftCandidate={leftCandidate} rightCandidate={rightCandidate} />
          </aside>
        </section>

        <section className="sectionBlock landingPreview">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Preview Inventory</p>
              <h2>승인된 사람만 보는 실제 매물 보드</h2>
              <p>viewer는 여기까지, admin 이상은 상세와 사진 갤러리로 이어집니다.</p>
            </div>
          </div>

          <div className="candidateGrid">
            {mockCandidates.map((candidate) => (
              <article key={candidate.id} className="candidateCard">
                <div className="cardTop">
                  <div>
                    <div className="cardRegion">{candidate.region}</div>
                    <h3 className="cardName">{candidate.full_name}</h3>
                  </div>
                </div>
                <p className="candidateMeta">
                  {candidate.birth_year}년생 · {candidate.region} · {candidate.occupation}
                </p>
                <p className="cardHeadline">{candidate.personality_summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
