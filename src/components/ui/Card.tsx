import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tint?: "white" | "lavender" | "sage" | "peach" | "teal" | "cream";
};

const tints = {
  white: "bg-white",
  lavender: "bg-lavender-50",
  sage: "bg-sage-100",
  peach: "bg-peach-50",
  teal: "bg-teal-50",
  cream: "bg-cream-100",
};

export function Card({ tint = "white", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-6 shadow-soft",
        tints[tint],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
