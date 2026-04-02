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
    <article
      className={`overflow-hidden rounded-[26px] border border-rose-100/50 border-t-4 bg-white/95 shadow-[0_10px_40px_rgb(244,114,182,0.1)] backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[0_16px_48px_rgb(244,114,182,0.14)] ${getStatusTopBorderClass(candidate.status)}`}
    >
      <div className="p-6">
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
          {ageLabel ? (
            <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-600">
              {ageLabel}
            </span>
          ) : null}
          {candidate.occupation ? (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-600">
              {candidate.occupation}
            </span>
          ) : null}
          {candidate.region ? (
            <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-600">
              {candidate.region}
            </span>
          ) : null}
          {extraMeta.map((item, i) => (
            <span
              key={`${candidate.id}-${item}`}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                i % 2 === 0 ? "bg-orange-100 text-orange-600" : "bg-rose-100 text-rose-600"
              }`}
            >
              {item}
            </span>
          ))}
          {candidate.highlight_tags.map((tag) => (
            <span
              key={`${candidate.id}-${tag}`}
              className="inline-flex items-center rounded-full border border-rose-200/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-rose-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {detailItems.length ? (
          <div className="mt-4 grid gap-2 rounded-2xl border border-rose-100/40 bg-rose-50/40 p-4">
            {detailItems.map((item) => (
              <p key={`${candidate.id}-${item}`} className="text-sm leading-6 text-slate-600">
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
            <p className="mt-2 text-sm leading-6 text-slate-600">{candidate.notes_private}</p>
          </div>
        ) : null}

        <div className="mt-4 flex max-w-3xl items-center justify-between gap-4 border-t border-rose-100/50 pt-3">
          <span className="text-sm text-slate-500">
            {canAccessCandidateDetail(role)
              ? "상세 프로필과 사진 검토"
              : `${getRoleLabel(role)} 권한은 비교 리스트만 열람`}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">
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
