"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import { PersonPreview } from "@/components/person-preview";
import { RomanceIllustration } from "@/components/romance-illustration";
import { SceneBackdrop } from "@/components/scene-backdrop";
import type { Candidate } from "@/lib/types";

type LandingSceneProps = {
  leftCandidate: Candidate;
  rightCandidate: Candidate;
};

export function LandingScene({ leftCandidate, rightCandidate }: LandingSceneProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const canvasStyle = {
    ["--mx" as string]: "0",
    ["--my" as string]: "0",
  } satisfies CSSProperties;

  const updateMotion = (x: number, y: number) => {
    const node = canvasRef.current;

    if (!node) {
      return;
    }

    node.style.setProperty("--mx", x.toFixed(2));
    node.style.setProperty("--my", y.toFixed(2));
  };

  return (
    <div
      ref={canvasRef}
      className="loveCanvas parallaxReady"
      style={canvasStyle}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;

        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }

        frameRef.current = requestAnimationFrame(() => {
          updateMotion(x, y);
        });
      }}
      onMouseLeave={() => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }

        frameRef.current = requestAnimationFrame(() => {
          updateMotion(0, 0);
        });
      }}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          key={`scene-petal-${index}`}
          className={`scenePetal scenePetal${(index % 4) + 1} ${index % 3 === 0 ? "scenePetalBlur" : ""}`}
        />
      ))}
      <span className="scenePetalEdge edgeOne" />
      <span className="scenePetalEdge edgeTwo" />
      <span className="scenePetalEdge edgeThree" />
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
      </div>

      <div className="lovePulse" />
      <div className="floatingHeart heartOne">♥</div>
      <div className="floatingHeart heartTwo">♥</div>
      <div className="floatingHeart heartThree">♥</div>
      <div className="floatingHeart heartFour">♥</div>
      <div className="loveSpark one" />
      <div className="loveSpark two" />
      <div className="loveSpark three" />

      <div className="parallaxLayer midLayer personLeftWrap leftCardMotion">
        <div className="personOrb personLeft">
          <PersonPreview imageUrl={leftCandidate.image_url} gender={leftCandidate.gender} size="sm" />
          <div className="personMeta">
            <strong>94년생 서울 기획자</strong>
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
            <strong>91년생 판교 개발자</strong>
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
