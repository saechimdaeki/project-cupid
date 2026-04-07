"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveDashboardCandidateImagePaths } from "@/lib/candidate-image-actions";
import { isDirectImageUrl } from "@/lib/image-url-utils";
import type { Candidate } from "@/lib/types";

/**
 * 대시보드: 서버는 Storage path만 내려주고, 서명은 Server Action으로만 수행합니다.
 */
export function useDashboardCandidateSignedImages(candidates: Candidate[]): Candidate[] {
  const [pathToSigned, setPathToSigned] = useState<Record<string, string | null>>({});

  const storagePathsKey = useMemo(() => {
    const set = new Set<string>();
    for (const candidate of candidates) {
      const value = candidate.image_url?.trim();
      if (value && !isDirectImageUrl(value)) set.add(value);
    }
    return [...set].sort().join("\n");
  }, [candidates]);

  useEffect(() => {
    if (!storagePathsKey) {
      setPathToSigned({});
      return;
    }

    const paths = storagePathsKey.split("\n").filter(Boolean);
    let cancelled = false;

    (async () => {
      try {
        const record = await resolveDashboardCandidateImagePaths(paths);
        if (!cancelled) setPathToSigned(record);
      } catch {
        if (!cancelled) {
          setPathToSigned(Object.fromEntries(paths.map((path) => [path, null] as const)));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storagePathsKey]);

  return useMemo(() => {
    return candidates.map((candidate) => {
      const raw = candidate.image_url?.trim() ?? null;
      if (!raw) return candidate;
      if (isDirectImageUrl(raw)) return candidate;
      if (!(raw in pathToSigned)) return candidate;
      return { ...candidate, image_url: pathToSigned[raw] };
    });
  }, [candidates, pathToSigned]);
}
