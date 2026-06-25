"use client";

import { cn } from "@/lib/utils";

type DateChipSelectorProps = {
  dates: readonly { value: string; label: string; short: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
};

export function DateChipSelector({
  dates,
  selected,
  onChange,
  label = "Which dates are you coming?",
}: DateChipSelectorProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((d) => d !== value));
    } else {
      onChange([...selected, value].sort());
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-label text-ink-600">{label}</p>
      <div className="flex flex-wrap gap-2">
        {dates.map((date) => {
          const isSelected = selected.includes(date.value);
          return (
            <button
              key={date.value}
              type="button"
              onClick={() => toggle(date.value)}
              className={cn(
                "rounded-pill px-4 py-2 text-body-sm font-semibold transition-colors",
                isSelected
                  ? "bg-plum-100 text-plum-700"
                  : "bg-cream-100 text-ink-600"
              )}
            >
              {date.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
