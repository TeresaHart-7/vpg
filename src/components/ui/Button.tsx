import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-body text-[15px] font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-plum-500 text-white shadow-soft hover:-translate-y-0.5 hover:bg-plum-700 hover:shadow-raised active:scale-[0.96]",
    secondary:
      "border-[1.5px] border-lavender-300 bg-cream-100 text-ink-900 hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.96]",
    ghost: "text-plum-500 hover:underline active:scale-[0.96]",
  };

  const sizes = {
    md: "h-11 px-5",
    sm: "h-9 px-4 text-body-sm",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "One moment…" : children}
    </button>
  );
}
