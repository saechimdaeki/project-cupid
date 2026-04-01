import type {
  CandidateProfile,
  MatchHistoryItem,
  ViewerProfile
} from "@/types/domain";

export const demoViewer: ViewerProfile = {
  id: "viewer-1",
  fullName: "김준성",
  role: "super_admin",
  approvalStatus: "approved"
};

export const demoCandidates: CandidateProfile[] = [
  {
    id: "cand-1",
    slug: "warm-product-designer-1994",
    headline: "차분하고 센스 있는 94년생 프로덕트 디자이너",
    name: "한별",
    birthYear: 1994,
    religion: "기독교",
    location: "서울 성수",
    occupation: "프로덕트 디자이너",
    status: "matched",
    summary:
      "관계에서 안정감을 중요하게 보고, 대화 리듬이 잘 맞는 사람과 천천히 신뢰를 쌓는 타입입니다.",
    idealType: ["정직한 표현", "생활 루틴이 건강한 사람", "배려가 자연스러운 사람"],
    personalityTags: ["차분함", "센스", "책임감", "대화가 편안함"],
    strengths: ["첫인상이 부드럽다", "상대 배려를 잘한다", "장기 관계 지향적이다"],
    cautions: ["과한 허세에 피로감을 느낀다", "연락 템포가 지나치게 들쑥날쑥하면 어렵다"],
    imageHint: "soft neutral portrait",
    lastUpdatedAt: "2026-03-29"
  },
  {
    id: "cand-2",
    slug: "faithful-startup-operator-1991",
    headline: "성실하고 유쾌한 91년생 스타트업 오퍼레이터",
    name: "지훈",
    birthYear: 1991,
    religion: "무교",
    location: "서울 잠실",
    occupation: "스타트업 운영 총괄",
    status: "graduated",
    summary:
      "에너지가 안정적이고 현실 감각이 좋습니다. 관계에서는 명확함과 꾸준함을 중요하게 생각합니다.",
    idealType: ["생활력이 있는 사람", "가볍지 않은 대화", "가족관이 건강한 사람"],
    personalityTags: ["유쾌함", "성실함", "현실감각", "꾸준함"],
    strengths: ["상대의 긴장을 풀어준다", "생활 밸런스가 좋다", "가치관이 분명하다"],
    cautions: ["지나치게 즉흥적인 성향과는 안 맞을 수 있다"],
    imageHint: "premium lifestyle portrait",
    lastUpdatedAt: "2026-03-20"
  },
  {
    id: "cand-3",
    slug: "calm-consultant-1996",
    headline: "대화 밀도가 높은 96년생 컨설턴트",
    name: "수아",
    birthYear: 1996,
    religion: "천주교",
    location: "서울 여의도",
    occupation: "전략 컨설턴트",
    status: "active",
    summary:
      "일에 대한 집중력이 높고, 관계에서도 서로의 성장을 돕는 파트너십을 중요하게 봅니다.",
    idealType: ["지적인 호기심", "자기 일에 애정이 있는 사람", "예의가 탄탄한 사람"],
    personalityTags: ["지적임", "분석적", "진중함", "깔끔함"],
    strengths: ["대화 주제가 넓다", "약속과 기준이 분명하다", "성장 의지가 강하다"],
    cautions: ["감정 표현이 극단적으로 적은 사람은 답답하게 느낄 수 있다"],
    imageHint: "editorial portrait",
    lastUpdatedAt: "2026-03-31"
  }
];

export const demoMatches: MatchHistoryItem[] = [
  {
    id: "match-1",
    candidateId: "cand-1",
    counterpartLabel: "93년생 브랜드 매니저",
    matchmaker: "김준성",
    introducedAt: "2026-02-18",
    stageLabel: "3회차 만남 진행",
    outcome: "in_progress",
    story: "첫 만남 이후 대화 빈도가 안정적으로 유지되고 있고, 취향 접점이 많아 다음 만남이 이어지고 있습니다."
  },
  {
    id: "match-2",
    candidateId: "cand-1",
    counterpartLabel: "92년생 개발자",
    matchmaker: "신뢰 중매단 A",
    introducedAt: "2025-11-03",
    stageLabel: "마무리",
    outcome: "closed",
    story: "서로 호감은 있었지만 장기적인 생활 리듬이 달라 자연스럽게 종료되었습니다."
  },
  {
    id: "match-3",
    candidateId: "cand-2",
    counterpartLabel: "94년생 변호사",
    matchmaker: "김준성",
    introducedAt: "2025-08-25",
    stageLabel: "커플 성사",
    outcome: "coupled",
    story: "교제 시작 후 관계가 안정적으로 이어져 현재는 커플 상태이며 매물은 졸업 처리되었습니다."
  }
];

