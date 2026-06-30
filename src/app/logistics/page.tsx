import { Suspense } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { LogisticsHub } from "@/components/logistics/LogisticsHub";
import { requireAuth, getCurrentProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ submission?: string; tab?: string }>;
};

export default async function LogisticsPage({ searchParams }: Props) {
  await requireAuth();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { submission: highlightSubmissionId } = await searchParams;
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("logistics_submissions")
    .select(
      `
      *,
      profiles ( id, name, photo_url ),
      logistics_replies (
        *,
        profiles ( id, name, photo_url )
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Logistics hub</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Coordinate travel, accommodation, and supplies with the village.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-body-md text-ink-600">Loading…</p>}>
            <LogisticsHub
              submissions={submissions || []}
              myProfileId={profile.id}
              highlightSubmissionId={highlightSubmissionId}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
