import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";

type GenderToggleFieldProps = {
  name: string;
  label?: string;
  defaultValue?: string | null;
  required?: boolean;
};

export function GenderToggleField({
  name,
  label = "성별",
  defaultValue,
  required = false,
}: GenderToggleFieldProps) {
  const normalizedValue =
    defaultValue === "남성" ? "남" : defaultValue === "여성" ? "여" : defaultValue;

  return (
    <fieldset className="grid gap-2">
      <legend className="flex flex-wrap items-center gap-2 text-[0.96rem] font-bold text-secondary-foreground">
        <span>{label}</span>
        <Badge
          variant="secondary"
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            required ? "bg-secondary text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {required ? "[필수]" : "[선택]"}
        </Badge>
      </legend>
      <div className="grid grid-cols-2 gap-3">
        <label className="group">
          <input
            className="peer sr-only"
            type="radio"
            name={name}
            value="남"
            defaultChecked={normalizedValue === "남"}
            required={required}
          />
          <span className="flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card/90 px-4 text-sm font-semibold text-secondary-foreground transition peer-checked:border-accent peer-checked:bg-gradient-to-r peer-checked:from-accent peer-checked:to-primary peer-checked:text-foreground group-hover:-translate-y-0.5">
            남
          </span>
        </label>
        <label className="group">
          <input
            className="peer sr-only"
            type="radio"
            name={name}
            value="여"
            defaultChecked={normalizedValue === "여"}
            required={required}
          />
          <span className="flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card/90 px-4 text-sm font-semibold text-secondary-foreground transition peer-checked:border-accent peer-checked:bg-gradient-to-r peer-checked:from-accent peer-checked:to-primary peer-checked:text-foreground group-hover:-translate-y-0.5">
            여
          </span>
        </label>
      </div>
    </fieldset>
  );
}
