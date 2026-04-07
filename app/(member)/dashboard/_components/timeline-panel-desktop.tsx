import { cn } from "@/lib/cn";
import type { TimelineEvent } from "@/lib/types";
import { TimelinePanelContent } from "./timeline-panel-content";

type TimelinePanelDesktopProps = {
  events: TimelineEvent[];
  onSelectEvent: (event: TimelineEvent) => void;
  className?: string;
};

export function TimelinePanelDesktop({
  events,
  onSelectEvent,
  className,
}: TimelinePanelDesktopProps) {
  return (
    <aside
      className={cn(
        "hidden w-full rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-[0_12px_40px_rgb(244,114,182,0.1)] backdrop-blur-md xl:block",
        className,
      )}
    >
      <TimelinePanelContent
        events={events}
        onSelectEvent={onSelectEvent}
      />
    </aside>
  );
}
