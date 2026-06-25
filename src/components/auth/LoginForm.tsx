"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas/registration";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const authError = searchParams.get("error");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    // Always use the current site origin so magic links match where you're browsing
    // (avoids localhost being baked in from a mis-set Vercel env var).
    const siteUrl = window.location.origin;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });

    setLoading(false);
    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("rate limit") || msg.includes("429")) {
        setError(
          "Too many login emails sent recently. Supabase limits magic links to a few per hour — wait about an hour, then try again. Check your inbox for an earlier link (they expire after ~1 hour)."
        );
      } else {
        setError(authError.message);
      }
      return;
    }
    setSent(true);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader showNav={false} />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <Card className="bg-white">
          {sent ? (
            <div className="text-center">
              <h1 className="text-display-md">Check your email</h1>
              <p className="mt-3 text-body-md text-ink-600">
                We sent you a magic link. Click it to sign in — no password needed.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-display-md">Welcome back</h1>
              <p className="mt-2 text-body-md text-ink-600">
                No password needed — we&apos;ll email you a link.
              </p>
              <p className="mt-3 rounded-md bg-lavender-50 px-3 py-2 text-body-sm text-ink-600">
                Look for an email from{" "}
                <strong className="text-ink-900">Supabase</strong> (
                <span className="text-ink-600">noreply@mail.app.supabase.io</span>
                ). Click <strong>Sign in</strong> once — the link works a single time
                and expires after about an hour.
              </p>
              {authError === "auth" && (
                <p className="mt-3 rounded-sm bg-error-bg px-3 py-2 text-body-sm text-error">
                  That sign-in link didn&apos;t work — it may have expired or already
                  been used. Request a fresh link below (wait an hour if you hit the
                  email rate limit).
                </p>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
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
      </main>
    </div>
  );
}
