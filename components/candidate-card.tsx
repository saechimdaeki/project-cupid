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
  const metaItems = [
    candidate.birth_year ? `${candidate.birth_year}년생` : null,
    candidate.gender || null,
    candidate.occupation || null,
  ].filter(Boolean);

  const cardBody = (
    <article className="candidateCard flex h-full flex-col gap-4 rounded-[28px] border border-[#ead8cf] bg-white/90 p-5 shadow-[0_14px_36px_rgba(143,95,89,0.08)] transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b46d59]">
            {candidate.region || "지역 미정"}
          </div>
          <h3 className="mt-2 text-[1.6rem] font-semibold tracking-[-0.05em] text-[#24161c]">
            {candidate.full_name}
          </h3>
        </div>
        <StatusBadge tone={statusToneMap[candidate.status]}>
          {candidate.status === "graduated" ? "졸업" : candidate.status}
        </StatusBadge>
      </div>

      <p className="text-sm leading-6 text-[#6d5961]">
        {metaItems.length ? metaItems.join(" · ") : "기본 정보는 상세 화면에서 확인합니다"}
      </p>

      <p className="text-sm leading-7 text-[#4f3941]">
        {candidate.personality_summary || "소개 메모는 아직 입력되지 않았습니다."}
      </p>

      <div className="flex flex-wrap gap-2">
        {candidate.highlight_tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex min-h-8 items-center rounded-full border border-[#ead8cf] bg-[#fff7f4] px-3 text-xs font-semibold text-[#725861]"
          >
            {tag}
          </span>
        ))}
      </div>

      {!canAccessCandidateDetail(role) && (
        <div className="rounded-2xl border border-[#f0e2da] bg-[#fffaf7] px-4 py-3 text-sm font-medium text-[#8a6b74]">
          {getRoleLabel(role)} 권한은 목록만 열람할 수 있습니다
        </div>
      )}
    </article>
  );

  if (!canAccessCandidateDetail(role)) {
    return <div className="block h-full">{cardBody}</div>;
  }

  return (
    <Link href={`/profiles/${candidate.id}`} className="block h-full">
      {cardBody}
    </Link>
  );
}
