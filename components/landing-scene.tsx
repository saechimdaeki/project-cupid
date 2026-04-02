import { PersonPreview } from "@/components/person-preview";
import { SceneBackdrop } from "@/components/scene-backdrop";
import type { Candidate } from "@/lib/types";

type LandingSceneProps = {
  leftCandidate: Candidate;
  rightCandidate: Candidate;
};

export function LandingScene({ leftCandidate, rightCandidate }: LandingSceneProps) {
  return (
    <div className="loveCanvas">
      <div className="parallaxLayer farLayer">
        <SceneBackdrop />
        <div className="loveCanvasGlow glowOne" />
        <div className="loveCanvasGlow glowTwo" />
        <div className="loveCanvasSpotlight" />
        <div className="loveCanvasRibbon ribbonOne" />
        <div className="loveCanvasRibbon ribbonTwo" />
      </div>

      <div className="parallaxLayer nearLayer">
        <div className="absolute left-[52%] top-[12%] h-14 w-14 -translate-x-1/2 rounded-full border border-white/40 bg-white/20 backdrop-blur-xl" />
        <div className="absolute left-[54%] top-[60%] h-3 w-3 -translate-x-1/2 rounded-full bg-white/70 shadow-[0_0_0_6px_rgba(255,255,255,0.22)]" />
      </div>

      <div className="parallaxLayer midLayer personLeftWrap leftCardMotion">
        <div className="personOrb personLeft">
          <PersonPreview
            imageUrl={leftCandidate.image_url}
            gender={leftCandidate.gender}
            loading="eager"
            size="sm"
            fit="cover"
            fetchPriority="high"
            position="top"
            className="bg-[#fffaf7]"
          />
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
          <PersonPreview
            imageUrl={rightCandidate.image_url}
            gender={rightCandidate.gender}
            loading="eager"
            size="sm"
            fit="cover"
            position="top"
            className="bg-[#fffaf7]"
          />
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
          <p className="eyebrow">Connection Mood</p>
          <strong>좋은 소개는 조건보다 분위기와 흐름을 섬세하게 읽는 데서 시작됩니다</strong>
          <span>첫 화면에서는 차갑게 분류하는 느낌보다, 따뜻하고 신뢰감 있는 연결의 공기를 먼저 보여줍니다.</span>
        </div>
      </div>
    </div>
  );
}
