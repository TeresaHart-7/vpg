import { Suspense } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { LogisticsHub } from "@/components/logistics/LogisticsHub";
import { ParticipantGuideSection } from "@/components/logistics/ParticipantGuideSection";
import { requireAuth, getCurrentProfile, getContentBlock } from "@/lib/auth/helpers";
import { getPageContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ submission?: string; tab?: string }>;
};

export default async function LogisticsPage({ searchParams }: Props) {
  await requireAuth();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const page = getPageContent("logistics");
  const participantInfo = page.participantInfo as Record<string, string>;
  const coordination = page.coordination as Record<string, string>;
  const { submission: highlightSubmissionId } = await searchParams;
  const supabase = await createClient();
  const guideContent = await getContentBlock("participant_guide");

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
        <h1 className="text-display-lg">{page.title}</h1>
        <p className="mt-2 text-body-md text-ink-600">{page.subtitle as string}</p>

        <div className="mt-10 space-y-12">
          <ParticipantGuideSection
            content={guideContent}
            title={participantInfo.title}
            subtitle={participantInfo.subtitle}
            checklistButton={participantInfo.checklistButton}
          />

          <section>
            <h2 className="text-display-md">{coordination.title}</h2>
            <p className="mt-1 text-body-sm text-ink-600">{coordination.subtitle}</p>
            <div className="mt-6">
              <Suspense fallback={<p className="text-body-md text-ink-600">Loading…</p>}>
                <LogisticsHub
                  submissions={submissions || []}
                  myProfileId={profile.id}
                  highlightSubmissionId={highlightSubmissionId}
                />
              </Suspense>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
