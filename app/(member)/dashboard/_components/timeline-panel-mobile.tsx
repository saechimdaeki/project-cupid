"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { TimelineEvent } from "@/lib/types";
import { TimelineIcon } from "./dashboard-timeline-panel";
import { TimelinePanelContent } from "./timeline-panel-content";

type TimelinePanelMobileProps = {
  events: TimelineEvent[];
  onSelectEvent: (event: TimelineEvent) => void;
};

export function TimelinePanelMobile({
  events,
  onSelectEvent,
}: TimelinePanelMobileProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-6 z-30 size-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-[0_12px_40px_rgb(244,114,182,0.45)] transition hover:scale-[1.03] md:bottom-6 xl:hidden"
        aria-label="최근 매칭 기록 열기"
      >
        <TimelineIcon />
      </Button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[32px] p-5 xl:hidden">
          <TimelinePanelContent
            events={events}
            onSelectEvent={(event) => {
              setSheetOpen(false);
              onSelectEvent(event);
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
