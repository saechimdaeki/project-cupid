import { Card, CardContent } from "@/components/ui/card";
import { PersonPreview } from "@/components/person-preview";

const PREVIEW_PROFILES = [
  {
    id: "f",
    name: "김서연",
    region: "서울 마포",
    birthYear: 1996,
    gender: "여",
    occupation: "브랜드 마케터",
    imageUrl: "/99년생 여자 기획자.png",
  },
  {
    id: "m",
    name: "박도윤",
    region: "판교",
    birthYear: 1992,
    gender: "남",
    occupation: "백엔드 개발자",
    imageUrl: "/94년생 남자 개발자.png",
  },
];

export function LandingInventory() {
  return (
    <section className="flex flex-col items-center gap-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Preview Inventory
      </p>
      <h2 className="text-center text-foreground">승인된 사람만 보는 실제 매물 보드</h2>
      <p className="max-w-[50ch] text-center text-[15px] leading-7 text-muted-foreground">
        viewer는 여기까지, admin 이상은 상세와 사진 갤러리로 이어집니다.
      </p>

      <div className="mt-4 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PREVIEW_PROFILES.map((profile) => (
          <Card
            key={profile.id}
            className="overflow-hidden rounded-[28px] border-border/40 bg-card/60 p-0 shadow-md backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <div className="overflow-hidden rounded-[20px] border border-border/30 bg-secondary/40">
                <PersonPreview
                  imageUrl={profile.imageUrl}
                  size="sm"
                  fit="cover"
                  position="top"
                  className="h-72 bg-secondary/40 sm:h-80"
                />
              </div>
              <div className="px-1 pb-1 pt-4">
                <h3 className="text-foreground">
                  {profile.name} · {profile.region}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {profile.birthYear}년생 · {profile.gender} · {profile.occupation}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
