"use client";

import { useState } from "react";
import { CopySimple, EnvelopeSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { buildMailtoBcc } from "@/lib/mailto";

type Props = {
  emails: string[];
};

export function EmailFilteredAttendees({ emails }: Props) {
  const [copied, setCopied] = useState(false);
  const unique = [...new Set(emails.map((e) => e.trim()).filter(Boolean))];
  const hasEmails = unique.length > 0;
  const mailto = hasEmails ? buildMailtoBcc(unique) : null;

  const copy = async () => {
    if (!hasEmails) return;
    await navigator.clipboard.writeText(unique.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasEmails) {
    return (
      <p className="text-body-sm text-ink-600">
        No matching attendees with emails to copy.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={copy}>
          <CopySimple size={16} weight="bold" aria-hidden />
          {copied ? "Copied" : "Copy all emails"}
        </Button>
        {mailto ? (
          <a
            href={mailto}
            className="inline-flex items-center gap-2 text-body-sm font-semibold text-plum-500 hover:underline"
          >
            <EnvelopeSimple size={16} weight="bold" aria-hidden />
            Open in email
          </a>
        ) : (
          <p className="text-body-sm text-ink-600">
            Too many addresses for a mail link — use Copy and paste into BCC
            instead.
          </p>
        )}
      </div>
      {mailto && (
        <p className="text-body-sm text-ink-500">
          Opens your default mail app with addresses in BCC. If BCC is empty
          (common in Gmail), use Copy and paste into BCC instead.
        </p>
      )}
    </div>
  );
}
