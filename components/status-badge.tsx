type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "muted";
};

export function StatusBadge({ children, tone = "default" }: StatusBadgeProps) {
  return <span className={`statusBadge ${tone}`}>{children}</span>;
}
