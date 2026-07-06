"use client";

import { cn } from "@/lib/utils";

type ConnectionStrengthProps = {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  showNumber?: boolean;
};

const sizes = [6, 8, 11, 14];

export function ConnectionStrength({
  value,
  onChange,
  readOnly,
  showNumber,
}: ConnectionStrengthProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-end gap-1.5"
        role="group"
        aria-label={`Connection strength ${value} of 4`}
      >
        {[1, 2, 3, 4].map((level) => {
          const size = sizes[level - 1];
          const filled = level <= value;
          return (
            <button
              key={level}
              type="button"
              disabled={readOnly || !onChange}
              onClick={() => onChange?.(level === value ? 0 : level)}
              className={cn(
                "rounded-full transition-transform active:scale-110",
                filled ? "bg-plum-500" : "bg-lavender-100",
                readOnly && "cursor-default"
              )}
              style={{ width: size, height: size }}
              aria-label={`Strength ${level}`}
            />
          );
        })}
      </div>
      {showNumber && value > 0 && (
        <span className="text-body-sm font-semibold text-plum-700">{value}</span>
      )}
    </div>
  );
}
