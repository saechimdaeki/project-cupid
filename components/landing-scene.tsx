import { PersonPreview } from "@/components/person-preview";
import { RomanceIllustration } from "@/components/romance-illustration";
import { SceneBackdrop } from "@/components/scene-backdrop";
import type { Candidate } from "@/lib/types";

type LandingSceneProps = {
  leftCandidate: Candidate;
  rightCandidate: Candidate;
};

export function LandingScene({ leftCandidate, rightCandidate }: LandingSceneProps) {
  return (
    <div className="loveCanvas">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={`scene-petal-${index}`}
          className={`scenePetal scenePetal${(index % 4) + 1} ${index === 0 ? "scenePetalBlur" : ""}`}
        />
      ))}
      <span className="scenePetalEdge edgeOne" />
      <span className="scenePetalEdge edgeTwo" />
      <div className="parallaxLayer farLayer">
        <SceneBackdrop />
        <div className="loveCanvasGlow glowOne" />
        <div className="loveCanvasGlow glowTwo" />
        <div className="loveCanvasSpotlight" />
        <div className="loveCanvasRibbon ribbonOne" />
        <div className="loveCanvasRibbon ribbonTwo" />
      </div>

      <div className="parallaxLayer nearLayer">
        <div className="miniToken tokenStar">
          <RomanceIllustration variant="spark" />
        </div>
        <div className="miniToken tokenHeart">
          <RomanceIllustration variant="seal" />
        </div>
        <div className="miniToken tokenFlower">
          <RomanceIllustration variant="letter" />
        </div>
        <div className="cupidToken" aria-hidden="true">
          <svg viewBox="0 0 180 120">
            <path
              d="M26 62c18-26 44-39 78-39 18 0 35 3 50 9"
              fill="none"
              stroke="rgba(214, 167, 111, 0.72)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M56 33c-3 18-3 36 0 54"
              fill="none"
              stroke="rgba(231, 151, 161, 0.58)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M58 34c9 4 18 11 24 20"
              fill="none"
              stroke="rgba(214, 167, 111, 0.62)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M56 84c9-4 18-11 24-20"
              fill="none"
              stroke="rgba(214, 167, 111, 0.62)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M86 58h58"
              fill="none"
              stroke="rgba(214, 167, 111, 0.82)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M140 48l18 10-18 10"
              fill="none"
              stroke="rgba(214, 167, 111, 0.82)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M104 58c0-6 4-10 9-10 3 0 5 1 5 4 0-3 2-4 5-4 5 0 9 4 9 10 0 8-6 13-14 18-8-5-14-10-14-18Z"
              fill="rgba(232, 145, 161, 0.88)"
            />
          </svg>
        </div>
      </div>

      <div className="lovePulse" />

      <div className="parallaxLayer midLayer personLeftWrap leftCardMotion">
        <div className="personOrb personLeft">
          <PersonPreview imageUrl={leftCandidate.image_url} gender={leftCandidate.gender} size="sm" />
          <div className="personMeta">
            <strong>
              {String(leftCandidate.birth_year).slice(2)}년생 {leftCandidate.region}{" "}
              {leftCandidate.occupation}
            </strong>
            <span>{leftCandidate.full_name} · {leftCandidate.work_summary}</span>
          </div>
        </div>
      </div>

      <div className="parallaxLayer farLayer">
        <div className="connectionBeam">
          <div className="beamOrbit orbitLeft" />
          <div className="beamOrbit orbitCenter" />
          <div className="beamOrbit orbitRight" />
          <span className="beamLabel beamTop">첫 연결</span>
          <span className="beamLabel beamMiddle">관계 진전</span>
        </div>
      </div>

      <div className="parallaxLayer midLayer personRightWrap rightCardMotion">
        <div className="personOrb personRight">
          <PersonPreview imageUrl={rightCandidate.image_url} gender={rightCandidate.gender} size="sm" />
          <div className="personMeta">
            <strong>
              {String(rightCandidate.birth_year).slice(2)}년생 {rightCandidate.region}{" "}
              {rightCandidate.occupation}
            </strong>
            <span>{rightCandidate.full_name} · {rightCandidate.work_summary}</span>
          </div>
        </div>
      </div>

      <div className="parallaxLayer nearLayer signatureWrap">
        <div className="loveSignature">
          <p className="eyebrow">Studio Mood</p>
          <strong>차갑게 분류하는 보드가 아니라, 좋은 시작을 만들어주는 스튜디오처럼 보여야 합니다</strong>
          <span>권한은 뒤에서 단단하게 지키고, 첫 화면에서는 설렘과 연결의 분위기가 먼저 읽히게 만듭니다.</span>
        </div>
      </div>
    </div>
  );
}
