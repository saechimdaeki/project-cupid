import Link from "next/link";
import { CandidateAvatarThumb } from "@/components/candidate-avatar-thumb";
import { canAccessCandidateDetail } from "@/lib/role-utils";
import { getStatusBadgeClass, getStatusLabel, getStatusTopBorderClass } from "@/lib/status-ui";
import type { AppRole, Candidate } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CandidateCardProps = {
  candidate: Candidate;
  role?: AppRole;
};

export function CandidateCard({ candidate, role = "viewer" }: CandidateCardProps) {
  const birthYearText = candidate.birth_year
    ? `${String(candidate.birth_year).slice(-2)}년생`
    : null;

  const specTags = [
    candidate.height_text ?? null,
    candidate.religion || null,
    candidate.mbti || null,
    candidate.gender || null,
  ].filter(Boolean) as string[];

  const body = (
    <Card
      className={cn(
        "rounded-[26px] border-rose-100/50 border-t-4 bg-card/95 shadow-[0_10px_40px_rgb(244,114,182,0.1)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgb(244,114,182,0.14)]",
        getStatusTopBorderClass(candidate.status),
      )}
    >
      <CardContent className="p-4">
        {/* 헤더 */}
        <div className="flex items-start gap-3">
          <CandidateAvatarThumb
            imageUrl={candidate.image_url}
            gender={candidate.gender}
            className="h-12 w-12 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {candidate.full_name.trim() ? (
                  <p className="text-sm font-bold text-rose-500">{candidate.full_name.trim()}</p>
                ) : null}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[birthYearText, candidate.region, candidate.occupation]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  getStatusBadgeClass(candidate.status),
                )}
              >
                {getStatusLabel(candidate.status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* 소개 */}
        {candidate.work_summary ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {candidate.work_summary}
          </p>
        ) : null}

        {candidate.personality_summary ? (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {candidate.personality_summary}
          </p>
        ) : null}

        {/* 태그 */}
        {specTags.length > 0 || candidate.highlight_tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {specTags.map((tag) => (
              <Badge
                key={`${candidate.id}-spec-${tag}`}
                variant="secondary"
                className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600"
              >
                {tag}
              </Badge>
            ))}
            {candidate.highlight_tags.map((tag) => (
              <Badge
                key={`${candidate.id}-tag-${tag}`}
                variant="outline"
                className="rounded-full border-rose-200/60 px-2 py-0.5 text-xs font-medium text-rose-500"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* 메모 */}
        {candidate.notes_private ? (
          <div className="mt-2 rounded-xl border border-rose-100/60 bg-rose-50/50 px-3 py-2">
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {candidate.notes_private}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  if (!canAccessCandidateDetail(role)) {
    return body;
  }

  return (
    <Link href={`/profiles/${candidate.id}`} className="block">
      {body}
    </Link>
  );
}
