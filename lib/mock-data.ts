import type { Candidate, MatchRecord, Membership } from "@/lib/types";

export const mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    full_name: "김서연",
    birth_year: 1994,
    gender: "여성",
    region: "서울",
    occupation: "기획자",
    work_summary: "INNOVATE · 서비스 기획",
    education: "연세대학교",
    religion: "무교",
    mbti: "ENFJ",
    personality_summary:
      "차분하고 센스가 있으며, 대화 흐름을 편하게 만들고 상대를 세심하게 배려하는 타입.",
    ideal_type: "성실하고 유머가 있으며 가족관계가 안정적인 사람.",
    notes_private: "주말에는 전시와 러닝을 즐김. 비흡연 선호.",
    status: "active",
    highlight_tags: ["대화잘함", "서울거주", "비흡연 선호"],
    image_url: "/99%E1%84%82%E1%85%A7%E1%86%AB%E1%84%89%E1%85%A2%E1%86%BC%20%E1%84%8B%E1%85%A7%E1%84%8C%E1%85%A1%20%E1%84%80%E1%85%B5%E1%84%92%E1%85%AC%E1%86%A8%E1%84%8C%E1%85%A1.png",
    created_at: "2026-03-20T09:00:00.000Z",
    created_by_name: "관리자",
  },
  {
    id: "cand-2",
    full_name: "박도윤",
    birth_year: 1991,
    gender: "남성",
    region: "판교",
    occupation: "개발자",
    work_summary: "INNOVATE · 백엔드 개발",
    education: "고려대학교",
    religion: "기독교",
    mbti: "ISTJ",
    personality_summary:
      "유쾌하면서도 성실하고 생활 감각이 좋아, 신뢰감 있는 관계를 차분하게 쌓아가는 스타일.",
    ideal_type: "생활 루틴이 맞고 따뜻한 대화를 오래 이어갈 수 있는 사람.",
    notes_private: "운동 꾸준히 함. 결혼 의지가 분명함.",
    status: "couple",
    highlight_tags: ["결혼의지 높음", "판교", "운동습관"],
    image_url: "/94%E1%84%82%E1%85%A7%E1%86%AB%E1%84%89%E1%85%A2%E1%86%BC%20%E1%84%82%E1%85%A1%E1%86%B7%E1%84%8C%E1%85%A1%20%E1%84%80%E1%85%A2%E1%84%87%E1%85%A1%E1%86%AF%E1%84%8C%E1%85%A1.png",
    created_at: "2026-02-18T09:00:00.000Z",
    created_by_name: "관리자",
  },
];

export const mockMatchRecords: MatchRecord[] = [
  {
    id: "match-1",
    candidate_id: "cand-1",
    counterpart_label: "1991년생 판교 개발자",
    matchmaker_name: "준성",
    outcome: "first_meeting",
    summary: "첫 식사 이후 한 번 더 보기로 했고 대화 흐름이 좋았음.",
    happened_on: "2026-03-26",
  },
];

export const mockMemberships: Membership[] = [
  {
    user_id: "user-1",
    username: "junseong",
    full_name: "준성 김",
    role: "super_admin",
    status: "approved",
    approved_by: null,
    created_at: "2026-03-15T00:00:00.000Z",
  },
];
