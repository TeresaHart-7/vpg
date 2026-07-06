"use client";

import { SelectionPill } from "@/components/ui/SelectionPill";

type DateChipSelectorProps = {
  dates: readonly { value: string; label: string; short: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  disabled?: boolean;
  notComingHint?: string;
};

export function DateChipSelector({
  dates,
  selected,
  onChange,
  label = "Which dates are you coming?",
  disabled = false,
  notComingHint,
}: DateChipSelectorProps) {
  const toggle = (value: string) => {
    if (disabled) return;
    if (selected.includes(value)) {
      onChange(selected.filter((d) => d !== value));
    } else {
      onChange([...selected, value].sort());
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-label text-ink-600">{label}</p>
      {disabled && notComingHint && (
        <p className="text-body-sm italic text-ink-600">{notComingHint}</p>
      )}
      <div className={`flex flex-wrap gap-2 ${disabled ? "pointer-events-none opacity-50" : ""}`}>
        {dates.map((date) => {
          const isSelected = selected.includes(date.value);
          return (
            <SelectionPill
              key={date.value}
              selected={isSelected}
              onClick={() => toggle(date.value)}
            >
              {date.short}
            </SelectionPill>
          );
        })}
      </div>
    </div>
  );
}
