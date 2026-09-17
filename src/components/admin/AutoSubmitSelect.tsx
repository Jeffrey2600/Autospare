"use client";

export function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  hiddenFields,
  action,
  className,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  hiddenFields: Record<string, string>;
  action: (formData: FormData) => void;
  className?: string;
}) {
  return (
    <form
      action={action}
      onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}
    >
      {Object.entries(hiddenFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <select name={name} defaultValue={defaultValue} className={className}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </form>
  );
}
