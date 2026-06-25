import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";
import { getPaymentStatus } from "@/lib/types/database";

type StatusBadgeProps = {
  status: "paid" | "pending" | "unpaid" | "coming" | "maybe" | "not_coming";
  className?: string;
};

const styles = {
  paid: "bg-sage-100 text-sage-600",
  pending: "bg-peach-100 text-peach-600",
  unpaid: "bg-peach-100 text-peach-600",
  coming: "bg-sage-100 text-sage-600",
  maybe: "bg-lavender-100 text-lavender-600",
  not_coming: "bg-cream-100 text-ink-600",
};

const labels = {
  paid: "Paid",
  pending: "Pay by Aug 31",
  unpaid: "Unpaid",
  coming: "Coming",
  maybe: "Maybe",
  not_coming: "Not coming",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-pill px-3 py-1 text-label",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}

export function PaymentBadge({
  profile,
}: {
  profile: Pick<Profile, "payment_sent_checkbox" | "will_pay_by_aug31_checkbox">;
}) {
  return <StatusBadge status={getPaymentStatus(profile)} />;
}

export function ComingBadge({
  isComing,
}: {
  isComing: Profile["is_coming"];
}) {
  if (!isComing) return null;
  const map = { yes: "coming", maybe: "maybe", no: "not_coming" } as const;
  return <StatusBadge status={map[isComing]} />;
}
