import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-label text-ink-600">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-sm border border-ink-300 bg-white px-4 text-body-md text-ink-900 placeholder:text-ink-300",
          error && "border-error",
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-body-sm text-ink-600">{hint}</p>}
      {error && <p className="text-body-sm text-error">{error}</p>}
    </div>
  );
}
