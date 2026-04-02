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
      <legend className="flex flex-wrap items-center gap-2 text-[0.96rem] font-bold text-[#725761]">
        <span>{label}</span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            required
              ? "bg-[#fff1e6] text-[#b46d59]"
              : "bg-[#f7f0eb] text-[#8b6a63]"
          }`}
        >
          {required ? "[필수]" : "[선택]"}
        </span>
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
          <span className="flex min-h-12 items-center justify-center rounded-2xl border border-[#e8d8cf] bg-white/90 px-4 text-sm font-semibold text-[#725861] transition peer-checked:border-[#d8b28a] peer-checked:bg-gradient-to-r peer-checked:from-[#f2c98d] peer-checked:to-[#c78662] peer-checked:text-[#2b1b11] group-hover:-translate-y-0.5">
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
          <span className="flex min-h-12 items-center justify-center rounded-2xl border border-[#e8d8cf] bg-white/90 px-4 text-sm font-semibold text-[#725861] transition peer-checked:border-[#d8b28a] peer-checked:bg-gradient-to-r peer-checked:from-[#f2c98d] peer-checked:to-[#c78662] peer-checked:text-[#2b1b11] group-hover:-translate-y-0.5">
            여
          </span>
        </label>
      </div>
    </fieldset>
  );
}
