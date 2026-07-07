import { Suspense } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { SessionsHub } from "@/components/event/SessionsHub";
import { requireAuth, getCurrentProfile } from "@/lib/auth/helpers";
import { getPageContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ session?: string }>;
};

export default async function EventSessionsPage({ searchParams }: Props) {
  await requireAuth();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const page = getPageContent("event-sessions");
  const { session: highlightSessionId } = await searchParams;
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("camp_sessions")
    .select(
      `
      *,
      profiles ( id, name, photo_url ),
      camp_session_votes ( id, session_id, profile_id, created_at ),
      camp_session_replies (
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
        <h1 className="text-display-lg">{page.title as string}</h1>
        <p className="mt-2 text-body-md text-ink-600">{page.subtitle as string}</p>
        <div className="mt-6">
          <EventSubnav />
        </div>
        <div className="mt-8">
          <Suspense fallback={<p className="text-body-md text-ink-600">Loading…</p>}>
            <SessionsHub
              sessions={sessions || []}
              myProfileId={profile.id}
              highlightSessionId={highlightSessionId}
              placeholder={page.placeholder as string}
              emptyMessage={page.emptyMessage as string}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
