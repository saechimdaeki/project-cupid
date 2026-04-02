"use client";

import { useEffect, useState } from "react";

export function SplashIntro() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("cupid-splash-seen") === "1") {
      return;
    }

    setVisible(true);

    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 900);

    const doneTimer = window.setTimeout(() => {
      window.sessionStorage.setItem("cupid-splash-seen", "1");
      setVisible(false);
    }, 1280);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`splashOverlay ${leaving ? "leave" : ""}`}
      aria-hidden="true"
    >
      <button
        type="button"
        className="splashSkip"
        onClick={() => {
          window.sessionStorage.setItem("cupid-splash-seen", "1");
          setLeaving(true);
          window.setTimeout(() => setVisible(false), 520);
        }}
      >
        건너뛰기
      </button>

      <div className="splashScene">
        <div className="splashAura" />
        <div className="splashAura second" />
        <span className="splashFloatHeart one">♥</span>
        <span className="splashFloatHeart two">♥</span>
        <span className="splashFloatHeart three">♥</span>
        <span className="splashFloatHeart four">♥</span>
        <span className="splashFloatHeart five">♥</span>

        <div className="splashPair">
          <div className="splashOrb left">
            <span />
          </div>
          <div className="splashHeartCore">
            <div className="heartPulse" />
            <div className="heartPulse" style={{ animationDelay: "0.9s" }} />
            <div className="heartGlyph">♥</div>
          </div>
          <div className="splashOrb right">
            <span />
          </div>
        </div>

        <div className="splashCopy">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">
            Project Cupid
          </p>
          <h1>좋은 인연을 잇습니다</h1>
          <p>
            첫 소개부터 커플 성사까지, 흐름을 차분하게 정리하는 프라이빗 매칭 워크스페이스
          </p>
        </div>
      </div>
    </div>
  );
}
