import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { canAccessCandidateDetail, getRoleLabel } from "@/lib/permissions";
import type { AppRole, Candidate } from "@/lib/types";

const statusToneMap = {
  active: "default",
  matched: "warning",
  couple: "success",
  graduated: "success",
  archived: "muted",
} as const;

type CandidateCardProps = {
  candidate: Candidate;
  role?: AppRole;
};

export function CandidateCard({ candidate, role = "viewer" }: CandidateCardProps) {
  const cardBody = (
    <article className="candidateCard">
      <div className="cardTop">
        <div>
          <div className="cardRegion">{candidate.region}</div>
          <h3 className="cardName">{candidate.full_name}</h3>
        </div>
        <StatusBadge tone={statusToneMap[candidate.status]}>
          {candidate.status === "graduated" ? "졸업" : candidate.status}
        </StatusBadge>
      </div>

      <p className="candidateMeta">
        {candidate.birth_year}년생 · {candidate.gender} · {candidate.occupation}
      </p>

      <p className="cardHeadline">{candidate.personality_summary}</p>

      <div className="tagRow">
        {candidate.highlight_tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      {!canAccessCandidateDetail(role) && (
        <div className="viewerHint">{getRoleLabel(role)} 권한은 목록만 열람할 수 있습니다</div>
      )}
    </article>
  );

  if (!canAccessCandidateDetail(role)) {
    return <div className="cardLink disabled">{cardBody}</div>;
  }

  return (
    <Link href={`/profiles/${candidate.id}`} className="cardLink">
      {cardBody}
    </Link>
  );
}
