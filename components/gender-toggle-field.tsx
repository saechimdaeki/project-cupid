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
    <fieldset className="segmentedFieldset">
      <legend>{label}</legend>
      <div className="segmentedOptions">
        <label className="segmentedOption">
          <input
            type="radio"
            name={name}
            value="남"
            defaultChecked={normalizedValue === "남"}
            required={required}
          />
          <span>남</span>
        </label>
        <label className="segmentedOption">
          <input
            type="radio"
            name={name}
            value="여"
            defaultChecked={normalizedValue === "여"}
            required={required}
          />
          <span>여</span>
        </label>
      </div>
    </fieldset>
  );
}
