type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "muted";
};

export function StatusBadge({ children, tone = "default" }: StatusBadgeProps) {
  const toneClassName =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : tone === "muted"
          ? "border-stone-200 bg-stone-100 text-stone-600"
          : "border-rose-100 bg-white/90 text-[#725861]";

  return (
    <span
      className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold tracking-[0.08em] ${toneClassName}`}
    >
      {children}
    </span>
  );
}
