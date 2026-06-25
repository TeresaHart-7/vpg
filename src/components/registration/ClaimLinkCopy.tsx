"use client";

import { useState } from "react";
import { LinkSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

export function ClaimLinkCopy({ claimToken, guestName }: { claimToken: string; guestName: string }) {
  const [copied, setCopied] = useState(false);
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "";

  const url = `${siteUrl}/claim/${claimToken}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={copy}>
        <LinkSimple size={16} />
        {copied ? "Copied!" : `Copy claim link for ${guestName}`}
      </Button>
    </div>
  );
}
