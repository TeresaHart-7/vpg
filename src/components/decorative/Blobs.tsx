import { cn } from "@/lib/utils";

type BlobProps = {
  className?: string;
  color?: "lavender" | "teal" | "peach" | "sage";
};

const colors = {
  lavender: "#B8A9D9",
  teal: "#8FC9BE",
  peach: "#F2AE85",
  sage: "#B7CFA0",
};

export function BlobOne({ className, color = "lavender" }: BlobProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={cn("pointer-events-none absolute opacity-[0.1]", className)}
      aria-hidden
    >
      <path
        fill={colors[color]}
        d="M220 20c60 10 120 50 140 110s-10 130-70 160-140 10-180-60S80 60 140 30s80-20 80-10z"
      />
    </svg>
  );
}

export function BlobTwo({ className, color = "teal" }: BlobProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={cn("pointer-events-none absolute opacity-[0.12]", className)}
      aria-hidden
    >
      <path
        fill={colors[color]}
        d="M200 30c80 0 150 60 160 140s-70 150-150 150S30 280 20 200 120 30 180 30z"
      />
    </svg>
  );
}

export function BlobThree({ className, color = "peach" }: BlobProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={cn("pointer-events-none absolute opacity-[0.08]", className)}
      aria-hidden
    >
      <path
        fill={colors[color]}
        d="M180 40c50-20 110 0 150 50s40 120 0 170-130 80-180 40S60 220 70 150s60-90 110-110z"
      />
    </svg>
  );
}

export function BlobFour({ className, color = "sage" }: BlobProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={cn("pointer-events-none absolute opacity-[0.1]", className)}
      aria-hidden
    >
      <path
        fill={colors[color]}
        d="M210 10c70 20 130 80 140 150s-30 130-100 150-150-30-170-100 20-180 80-150 30-20 50z"
      />
    </svg>
  );
}
