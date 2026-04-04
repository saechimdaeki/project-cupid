import Link from "next/link";
import { canAccessCandidateDetail, getRoleLabel } from "@/lib/role-utils";
import { getStatusBadgeClass, getStatusLabel, getStatusTopBorderClass } from "@/lib/status-ui";
import type { AppRole, Candidate } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CandidateCardProps = {
  candidate: Candidate;
  role?: AppRole;
};

function getAvatarEmoji(gender: string) {
  if (gender === "남") return "🤵";
  if (gender === "여") return "👰";
  return "💌";
}

function getHeadline(candidate: Candidate) {
  const parts = [
    candidate.birth_year ? `${String(candidate.birth_year).slice(-2)}년생` : null,
    candidate.occupation || null,
  ].filter(Boolean);

  return parts.length ? parts.join(" ") : candidate.full_name;
}

export function CandidateCard({ candidate, role = "viewer" }: CandidateCardProps) {
  const ageLabel = candidate.birth_year ? `${String(candidate.birth_year).slice(-2)}년생` : null;
  const extraMeta = [
    candidate.gender || null,
    candidate.height_text ? `키 ${candidate.height_text}` : null,
    candidate.religion ? `종교 ${candidate.religion}` : null,
    candidate.mbti || null,
  ].filter(Boolean) as string[];

  const detailItems = [
    candidate.work_summary || null,
    candidate.education || null,
    candidate.ideal_type ? `이상형 ${candidate.ideal_type}` : null,
  ].filter(Boolean);

  const body = (
    <Card
      className={cn(
        "rounded-[26px] border-rose-100/50 border-t-4 bg-card/95 shadow-[0_10px_40px_rgb(244,114,182,0.1)] backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[0_16px_48px_rgb(244,114,182,0.14)]",
        getStatusTopBorderClass(candidate.status),
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 text-[28px] shadow-inner">
            {getAvatarEmoji(candidate.gender)}
          </div>
          <div className="min-w-0 max-w-3xl flex-1">
            <div className="flex max-w-2xl flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400/90">
                  {candidate.full_name}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-foreground sm:text-xl">
                  {getHeadline(candidate)}
                </h3>
                {candidate.personality_summary ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
                    {candidate.personality_summary}
                  </p>
                ) : null}
              </div>
              <Badge
                variant="outline"
                className={cn("self-start rounded-full px-3 py-1 text-xs font-medium", getStatusBadgeClass(candidate.status))}
              >
                {getStatusLabel(candidate.status)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ageLabel ? (
            <Badge variant="secondary" className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-600">
              {ageLabel}
            </Badge>
          ) : null}
          {candidate.occupation ? (
            <Badge variant="secondary" className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-600">
              {candidate.occupation}
            </Badge>
          ) : null}
          {candidate.region ? (
            <Badge variant="secondary" className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-600">
              {candidate.region}
            </Badge>
          ) : null}
          {extraMeta.map((item, i) => (
            <Badge
              key={`${candidate.id}-${item}`}
              variant="secondary"
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium",
                i % 2 === 0 ? "bg-orange-100 text-orange-600" : "bg-rose-100 text-rose-600",
              )}
            >
              {item}
            </Badge>
          ))}
          {candidate.highlight_tags.map((tag) => (
            <Badge
              key={`${candidate.id}-${tag}`}
              variant="outline"
              className="rounded-full border-rose-200/60 bg-card/80 px-3 py-1.5 text-xs font-semibold text-rose-600"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {detailItems.length ? (
          <div className="mt-4 grid gap-2 rounded-2xl border border-rose-100/40 bg-rose-50/40 p-4">
            {detailItems.map((item) => (
              <p key={`${candidate.id}-${item}`} className="text-sm leading-6 text-muted-foreground">
                {item}
              </p>
            ))}
          </div>
        ) : null}

        {candidate.notes_private ? (
          <div className="mt-4 rounded-2xl border border-rose-100/60 bg-rose-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
              Private Memo
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{candidate.notes_private}</p>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-4 rounded-none border-t border-rose-100/50 bg-transparent px-6 py-3">
        <span className="text-sm text-muted-foreground">
          {canAccessCandidateDetail(role)
            ? "상세 프로필과 사진 검토"
            : `${getRoleLabel(role)} 권한은 비교 리스트만 열람`}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">
          profile
        </span>
      </CardFooter>
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
