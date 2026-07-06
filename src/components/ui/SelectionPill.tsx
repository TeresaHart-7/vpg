import { cn } from "@/lib/utils";
import { Check } from "@phosphor-icons/react";

export function selectionPillClass(isSelected: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-pill border-2 px-4 py-2 text-body-sm font-semibold transition-all",
    isSelected
      ? "border-plum-500 bg-plum-500 text-white shadow-soft ring-2 ring-plum-500/30"
      : "border-ink-300 bg-white text-ink-600 hover:border-lavender-300 hover:bg-cream-50"
  );
}

type SelectionPillProps = {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export function SelectionPill({ selected, onClick, children }: SelectionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={selectionPillClass(selected)}
    >
      {selected && (
        <Check size={14} weight="bold" className="shrink-0 text-white" aria-hidden />
      )}
      {children}
    </button>
  );
}
