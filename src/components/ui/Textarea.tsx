import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  maxLength?: number;
  value?: string;
};

export function Textarea({
  label,
  error,
  maxLength = 500,
  value = "",
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || props.name;
  const remaining = maxLength - (value?.length || 0);
  const counterColor =
    remaining <= 50 ? "text-peach-600" : "text-ink-600";

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-label text-ink-600">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            "min-h-[120px] w-full rounded-sm border border-ink-300 bg-white px-4 py-3 text-body-md text-ink-900 placeholder:text-ink-300",
            error && "border-error",
            className
          )}
          {...props}
        />
        <span
          className={cn(
            "absolute bottom-3 right-3 text-body-sm",
            counterColor
          )}
        >
          {value?.length || 0}/{maxLength}
        </span>
      </div>
      {error && <p className="text-body-sm text-error">{error}</p>}
    </div>
  );
}
