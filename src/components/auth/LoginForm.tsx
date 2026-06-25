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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
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
