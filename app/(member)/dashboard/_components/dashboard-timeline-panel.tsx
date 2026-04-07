"use client";

import { useState } from "react";
import { History } from "lucide-react";
import type { Candidate, TimelineEvent } from "@/lib/types";
import { TimelinePanelDesktop } from "./timeline-panel-desktop";
import { TimelinePanelMobile } from "./timeline-panel-mobile";
import { MatchDetailModal } from "./match-detail-modal";

export const TimelineIcon = () => <History className="size-5" />;

type DashboardTimelinePanelProps = {
  events: TimelineEvent[];
  candidates: Candidate[];
  className?: string;
};

export function DashboardTimelinePanel({
  events,
  candidates,
  className,
}: DashboardTimelinePanelProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));

  const handleSelectEvent = (event: TimelineEvent) => setSelectedEvent(event);

  return (
    <>
      <TimelinePanelDesktop
        events={events}
        onSelectEvent={handleSelectEvent}
        className={className}
      />
      <TimelinePanelMobile
        events={events}
        onSelectEvent={handleSelectEvent}
      />

      <MatchDetailModal
        event={selectedEvent}
        candidateById={candidateById}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
