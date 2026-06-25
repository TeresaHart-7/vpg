import { cn } from "@/lib/utils";

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: React.ReactNode;
  // label accepts string or JSX (e.g. icon + text tiles)
  description?: string;
  tile?: boolean;
  selected?: boolean;
};

export function Checkbox({
  label,
  description,
  tile,
  selected,
  className,
  ...props
}: CheckboxProps) {
  if (tile) {
    return (
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-md border-2 p-4 transition-colors",
          selected || props.checked
            ? "border-plum-500 bg-plum-100"
            : "border-lavender-100 bg-white hover:border-lavender-300",
          className
        )}
      >
        <input type="checkbox" className="sr-only" {...props} />
        <div>
          <span className="text-body-md font-semibold text-ink-900">{label}</span>
          {description && (
            <p className="mt-1 text-body-sm text-ink-600">{description}</p>
          )}
        </div>
      </label>
    );
  }

  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded-sm border-ink-300 text-plum-500 focus:ring-plum-500"
        {...props}
      />
      <div>
        <span className="text-body-md text-ink-900">{label}</span>
        {description && (
          <p className="text-body-sm text-ink-600">{description}</p>
        )}
      </div>
    </label>
  );
}
