"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";

const PETAL_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.853 2.392c2.86-3.19 9.626-2.57 12.199 1.519 1.943 3.09 1.22 7.76-1.5 10.363-2.802 2.68-6.712 5.68-10.626 11.334C13.16 20.195 9.123 17.28 6.177 14.675c-2.86-2.528-3.874-7.342-1.756-10.625C7.194-.231 13.96-.712 17.853 2.392Z" fill="#F9A8D4"/>
  <path d="M18.166 5.31c2.297-2.317 6.44-1.965 8.319.705" stroke="white" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/>
</svg>
`)}`;

type SakuraPetal = {
  fallDelay: string;
  fallDuration: string;
  left: string;
  opacity: number;
  rotate: string;
  scale: string;
  swayDelay: string;
  swayDuration: string;
  swayDistance: string;
  width: string;
};

function createSakuraPetals(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const width = 12 + ((index * 5) % 14);
    const left = `${((index * 7.3) + ((index * 11) % 19)) % 100}%`;
    const fallDuration = 15 + ((index * 3) % 16);
    const fallDelay = -((index * 1.4) % 24);
    const swayDuration = 4 + ((index * 5) % 5);
    const swayDelay = -((index * 0.8) % 6);
    const swayDistance = 14 + ((index * 4) % 24);
    const opacity = 0.22 + ((index * 2) % 6) * 0.08;
    const scale = 0.58 + ((index * 3) % 7) * 0.08;
    const rotate = -30 + ((index * 13) % 60);

    return {
      width: `${width}px`,
      left,
      fallDelay: `${fallDelay}s`,
      fallDuration: `${fallDuration}s`,
      swayDuration: `${swayDuration}s`,
      swayDelay: `${swayDelay}s`,
      swayDistance: `${swayDistance}px`,
      opacity,
      scale: `${scale}`,
      rotate: `${rotate}deg`,
    } satisfies SakuraPetal;
  });
}

type SakuraRainProps = {
  /** 최소 50개 권장 — 기본 60 */
  petalCount?: number;
};

export function SakuraRain({ petalCount = 60 }: SakuraRainProps) {
  const petals = useMemo(() => createSakuraPetals(petalCount), [petalCount]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {petals.map((petal, index) => (
        <span
          key={`${petal.left}-${index}`}
          className="sakura-petal-track"
          style={
            {
              left: petal.left,
              animationDelay: petal.fallDelay,
              animationDuration: petal.fallDuration,
              opacity: petal.opacity,
              ["--petal-sway-distance" as string]: petal.swayDistance,
            } as CSSProperties
          }
        >
          <span
            className="sakura-petal-drift"
            style={
              {
                animationDelay: petal.swayDelay,
                animationDuration: petal.swayDuration,
              } as CSSProperties
            }
          >
            <span
              className="sakura-petal"
              style={
                {
                  width: petal.width,
                  height: `${Math.round(Number.parseInt(petal.width, 10) * 0.78)}px`,
                  backgroundImage: `url("${PETAL_SVG}")`,
                  transform: `scale(${petal.scale}) rotate(${petal.rotate})`,
                } as CSSProperties
              }
            />
          </span>
        </span>
      ))}
    </div>
  );
}
