import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { RecordingForm } from "@/components/recordings/RecordingForm";
import { requireAuth, getCurrentProfile } from "@/lib/auth/helpers";
import { getPageContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";

export default async function NewRecordingPage() {
  await requireAuth();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const page = getPageContent("recordings-new");
  const supabase = await createClient();

  const { data } = await supabase.from("recordings").select("tags");
  const tagSet = new Set<string>();
  for (const row of data || []) {
    for (const t of row.tags || []) tagSet.add(t);
  }
  const tagSuggestions = [...tagSet].sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">{page.title as string}</h1>
        <p className="mt-2 text-body-md text-ink-600">{page.subtitle as string}</p>
        <div className="mt-6">
          <EventSubnav />
        </div>
        <div className="mt-8">
          <RecordingForm
            myProfileId={profile.id}
            userId={profile.user_id}
            tagSuggestions={tagSuggestions}
          />
        </div>
      </main>
    </div>
  );
}
