"use client";

import { useSearchParams } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Card } from "@/components/ui/Card";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const authError = searchParams.get("error");

  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader showNav={false} />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <Card className="bg-white">
          <h1 className="text-display-md">Welcome</h1>
          <p className="mt-2 text-body-md text-ink-600">
            Sign in with the Google account you&apos;d like to use for the
            gathering. No separate password — just Google.
          </p>

          {authError === "auth" && (
            <p className="mt-3 rounded-sm bg-error-bg px-3 py-2 text-body-sm text-error">
              Sign-in didn&apos;t complete. Please try again.
            </p>
          )}

          <div className="mt-6">
            <GoogleSignInButton redirectPath={redirect} />
          </div>

          <p className="mt-4 text-body-sm text-ink-600">
            First time here? Signing in creates your profile automatically.
            Use the same Google account each time you return.
          </p>
        </Card>
      </main>
    </div>
  );
}
