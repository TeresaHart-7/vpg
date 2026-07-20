"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";
import { getPaymentStatus } from "@/lib/types/database";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type PaymentProfile = Pick<
  Profile,
  "id" | "payment_sent_checkbox" | "will_pay_by_aug31_checkbox"
>;

const statusStyles = {
  paid: "bg-sage-100 text-sage-600",
  pending: "bg-peach-100 text-peach-600",
  unpaid: "bg-peach-100 text-peach-600",
} as const;

const statusLabels = {
  paid: "Payment received",
  pending: "Payment pending",
  unpaid: "Payment pending",
} as const;

type Props = {
  profile: PaymentProfile;
  sentCheckboxLabel: string;
  aug31CheckboxLabel: string;
};

export function PaymentStatusCard({
  profile,
  sentCheckboxLabel,
  aug31CheckboxLabel,
}: Props) {
  const router = useRouter();
  const status = getPaymentStatus(profile);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentSent, setPaymentSent] = useState(profile.payment_sent_checkbox);
  const [willPayByAug31, setWillPayByAug31] = useState(
    profile.will_pay_by_aug31_checkbox
  );

  const openModal = () => {
    setPaymentSent(profile.payment_sent_checkbox);
    setWillPayByAug31(profile.will_pay_by_aug31_checkbox);
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        payment_sent_checkbox: paymentSent,
        will_pay_by_aug31_checkbox: willPayByAug31,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      console.error(error);
      return;
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button type="button" onClick={openModal} className="w-full text-left">
        <Card tint="peach" className="transition-shadow hover:shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-display-sm">Payment</h2>
              <p className="mt-1 text-body-sm text-ink-600">
                Tap to update your payment status.
              </p>
              <span
                className={cn(
                  "mt-3 inline-flex rounded-pill px-3 py-1 text-label",
                  statusStyles[status]
                )}
              >
                {statusLabels[status]}
              </span>
            </div>
            <CaretRight className="shrink-0 text-ink-600" size={20} />
          </div>
        </Card>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Update payment status">
        <p className="mb-4 text-body-sm text-ink-600">
          Let the host crew know where things stand. You can also view full payment
          instructions on the{" "}
          <Link href="/payment" className="text-teal-600 hover:underline">
            payment page
          </Link>
          .
        </p>
        <div className="space-y-3">
          <Checkbox
            label={sentCheckboxLabel}
            checked={paymentSent}
            onChange={(e) => {
              const checked = e.target.checked;
              setPaymentSent(checked);
              if (checked) setWillPayByAug31(false);
            }}
          />
          <Checkbox
            label={aug31CheckboxLabel}
            checked={willPayByAug31}
            disabled={paymentSent}
            onChange={(e) => setWillPayByAug31(e.target.checked)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
