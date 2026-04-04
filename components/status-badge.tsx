import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "muted";
  className?: string;
};

const toneClasses = {
  default: "border-rose-100 bg-white/90 text-secondary-foreground",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  muted: "border-stone-200 bg-stone-100 text-stone-600",
} as const;

export function StatusBadge({ children, tone = "default", className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "min-h-9 rounded-full px-3 text-xs font-semibold tracking-[0.08em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </Badge>
  );
}
