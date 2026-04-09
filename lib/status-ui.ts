import type { CandidateStatus, MatchOutcome } from "@/lib/types";

export function getStatusLabel(status: CandidateStatus) {
  switch (status) {
    case "active":
      return "적극검토";
    case "matched":
      return "매칭진행중";
    case "couple":
      return "커플완성";
    case "graduated":
      return "졸업";
    case "archived":
      return "비활성화";
  }
}

export function getStatusTopBorderClass(status: CandidateStatus) {
  switch (status) {
    case "active":
      return "border-t-rose-500";
    case "matched":
      return "border-t-blue-500";
    case "couple":
      return "border-t-emerald-500";
    case "graduated":
      return "border-t-amber-500";
    case "archived":
      return "border-t-slate-400";
  }
}

export function getStatusAccentClass(status: CandidateStatus) {
  switch (status) {
    case "active":
      return "bg-rose-500";
    case "matched":
      return "bg-blue-500";
    case "couple":
      return "bg-emerald-500";
    case "graduated":
      return "bg-amber-500";
    case "archived":
      return "bg-slate-400";
  }
}

export function getStatusBadgeClass(status: CandidateStatus) {
  switch (status) {
    case "active":
      return "border-rose-100 bg-rose-50 text-rose-600";
    case "matched":
      return "border-blue-100 bg-blue-50 text-blue-600";
    case "couple":
      return "border-emerald-100 bg-emerald-50 text-emerald-600";
    case "graduated":
      return "border-amber-100 bg-amber-50 text-amber-600";
    case "archived":
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

export function getLaneSurfaceClass(status: CandidateStatus) {
  switch (status) {
    case "active":
      return "border-rose-100/80 bg-gradient-to-b from-rose-50/90 to-white/95";
    case "matched":
      return "border-orange-100/80 bg-gradient-to-b from-orange-50/85 to-white/95";
    case "couple":
      return "border-pink-200/60 bg-gradient-to-b from-pink-50/90 to-white/95";
    case "graduated":
      return "border-amber-100/80 bg-gradient-to-b from-amber-50/80 to-white/95";
    case "archived":
      return "border-rose-100/50 bg-gradient-to-b from-rose-50/40 to-white/90";
  }
}

export function getOutcomeDotClass(outcome: MatchOutcome) {
  switch (outcome) {
    case "intro_sent":
    case "first_meeting":
    case "dating":
      return "bg-blue-500";
    case "couple":
      return "bg-emerald-500";
    case "closed":
      return "bg-slate-400";
  }
}
