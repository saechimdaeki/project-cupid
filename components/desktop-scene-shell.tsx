"use client";

import { useEffect, useState } from "react";
import { LandingScene } from "@/components/landing-scene";
import type { Candidate } from "@/lib/types";

type DesktopSceneShellProps = {
  leftCandidate: Candidate;
  rightCandidate: Candidate;
};

export function DesktopSceneShell({
  leftCandidate,
  rightCandidate,
}: DesktopSceneShellProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const sync = () => setVisible(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return <LandingScene leftCandidate={leftCandidate} rightCandidate={rightCandidate} />;
}
