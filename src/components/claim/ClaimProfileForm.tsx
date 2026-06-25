"use client";

import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Props = {
  guestName: string;
  claimToken: string;
  alreadyClaimed: boolean;
};

export function ClaimProfileForm({ guestName, claimToken, alreadyClaimed }: Props) {
  if (alreadyClaimed) {
    return (
      <Card className="text-center">
        <h1 className="text-display-md">Already claimed</h1>
        <p className="mt-3 text-body-md text-ink-600">
          This profile has already been claimed. Log in to edit it.
        </p>
        <Link href="/login" className="mt-4 inline-block">
          <Button variant="secondary">Log in</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-display-md">Claim your profile</h1>
      <p className="mt-2 text-body-md text-ink-600">
        {guestName
          ? `${guestName} — someone added you to the Village Playground guest list.`
          : "You've been invited to claim a profile on the Village Playground."}{" "}
        Sign in with Google to take over this lightweight profile and add your
        own photo and bio.
      </p>
      <div className="mt-6">
        <GoogleSignInButton
          redirectPath={`/claim/${claimToken}/complete`}
          label="Continue with Google to claim"
        />
      </div>
    </Card>
  );
}
