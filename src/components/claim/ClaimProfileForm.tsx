"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type Props = {
  guestName: string;
  claimToken: string;
  alreadyClaimed: boolean;
};

export function ClaimProfileForm({ guestName, claimToken, alreadyClaimed }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (alreadyClaimed) {
    return (
      <Card className="text-center">
        <h1 className="text-display-md">Already claimed</h1>
        <p className="mt-3 text-body-md text-ink-600">
          This profile has already been claimed. Log in to edit it.
        </p>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?redirect=${encodeURIComponent(`/claim/${claimToken}/complete`)}`,
        data: { claim_token: claimToken },
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setSent(true);
  };

  return (
    <Card>
      {sent ? (
        <div className="text-center">
          <h1 className="text-display-md">Check your email</h1>
          <p className="mt-3 text-body-md text-ink-600">
            We sent a magic link to <strong>{email}</strong>. Click it to claim
            {guestName ? ` ${guestName}'s` : " this"} profile.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-display-md">Claim your profile</h1>
          <p className="mt-2 text-body-md text-ink-600">
            {guestName
              ? `${guestName} — someone added you to the Village Playground guest list.`
              : "You've been invited to claim a profile on the Village Playground."}{" "}
            Enter your email to take over this lightweight profile and add your
            own photo and bio.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Your email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && (
              <p className="rounded-sm bg-error-bg px-3 py-2 text-body-sm text-error">
                {error}
              </p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              Send me a magic link
            </Button>
          </form>
        </>
      )}
    </Card>
  );
}
