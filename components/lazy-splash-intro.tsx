"use client";

import dynamic from "next/dynamic";

const SplashIntro = dynamic(
  () => import("@/components/splash-intro").then((module) => module.SplashIntro),
  {
    ssr: false,
  },
);

export function LazySplashIntro() {
  return <SplashIntro />;
}
