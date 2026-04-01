"use client";

import { useEffect, useState } from "react";

export function SplashIntro() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  function closeSplash() {
    setIsLeaving(true);
    window.setTimeout(() => {
      window.sessionStorage.setItem("cupid-splash-seen", "1");
      setIsVisible(false);
    }, 320);
  }

  useEffect(() => {
    if (window.sessionStorage.getItem("cupid-splash-seen") === "1") {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const startLeave = window.setTimeout(() => {
      setIsLeaving(true);
    }, 1800);

    const finish = window.setTimeout(() => {
      window.sessionStorage.setItem("cupid-splash-seen", "1");
      setIsVisible(false);
    }, 2250);

    return () => {
      window.clearTimeout(startLeave);
      window.clearTimeout(finish);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`splashOverlay ${isLeaving ? "leave" : ""}`}
      onClick={closeSplash}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          closeSplash();
        }
      }}
    >
      <button
        className="splashSkip"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          closeSplash();
        }}
      >
        Skip
      </button>

      <div className="splashScene">
        <div className="splashAura" />
        <div className="splashAura second" />
        <div className="splashFloatHeart one">♥</div>
        <div className="splashFloatHeart two">♥</div>
        <div className="splashFloatHeart three">♥</div>
        <div className="splashFloatHeart four">♥</div>
        <div className="splashFloatHeart five">♥</div>

        <div className="splashPair">
          <div className="splashOrb left">
            <span />
          </div>
          <div className="splashHeartCore">
            <div className="heartPulse" />
            <div className="heartGlyph">♥</div>
          </div>
          <div className="splashOrb right">
            <span />
          </div>
        </div>

        <div className="splashCopy">
          <p className="eyebrow">Project Cupid</p>
          <h1>좋은 두 사람의 시작을 만듭니다</h1>
          <p>
            신뢰할 수 있는 사람들만 모여, 첫 소개부터 커플 성사까지의 흐름을
            밝고 선명하게 설계하는 프라이빗 매칭 스튜디오
          </p>
        </div>
      </div>
    </div>
  );
}
