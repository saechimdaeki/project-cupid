import Link from "next/link";
import { canAccessCandidateDetail, getRoleLabel } from "@/lib/role-utils";
import { getStatusBadgeClass, getStatusLabel, getStatusTopBorderClass } from "@/lib/status-ui";
import type { AppRole, Candidate } from "@/lib/types";

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
  const metaItems = [
    candidate.gender || null,
    candidate.height_text ? `키 ${candidate.height_text}` : null,
    candidate.region || null,
    candidate.religion ? `종교 ${candidate.religion}` : null,
    candidate.mbti || null,
  ].filter(Boolean);

  const detailItems = [
    candidate.work_summary || null,
    candidate.education || null,
    candidate.ideal_type ? `이상형 ${candidate.ideal_type}` : null,
  ].filter(Boolean);

  const body = (
    <article
      className={`overflow-hidden rounded-2xl border border-slate-200 border-t-4 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${getStatusTopBorderClass(candidate.status)}`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[28px]">
            {getAvatarEmoji(candidate.gender)}
          </div>
          <div className="min-w-0 max-w-3xl flex-1">
            <div className="flex max-w-2xl flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {candidate.full_name}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-800 sm:text-xl">
                  {getHeadline(candidate)}
                </h3>
                {candidate.personality_summary ? (
                  <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-2">
                    {candidate.personality_summary}
                  </p>
                ) : null}
              </div>
              <span
                className={`inline-flex items-center self-start rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeClass(candidate.status)}`}
              >
                {getStatusLabel(candidate.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {metaItems.map((item) => (
            <span
              key={`${candidate.id}-${item}`}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              {item}
            </span>
          ))}
          {candidate.highlight_tags.map((tag) => (
            <span
              key={`${candidate.id}-${tag}`}
              className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {detailItems.length ? (
          <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-4">
            {detailItems.map((item) => (
              <p key={`${candidate.id}-${item}`} className="text-sm leading-6 text-slate-600">
                {item}
              </p>
            ))}
          </div>
        ) : null}

        {candidate.notes_private ? (
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Private Memo
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{candidate.notes_private}</p>
          </div>
        ) : null}

        <div className="mt-4 flex max-w-3xl items-center justify-between gap-4 border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-500">
            {canAccessCandidateDetail(role)
              ? "상세 프로필과 사진 검토"
              : `${getRoleLabel(role)} 권한은 비교 리스트만 열람`}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            profile
          </span>
        </div>
      </div>
    </article>
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
