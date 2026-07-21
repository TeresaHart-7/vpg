import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { RecordingsFeed } from "@/components/recordings/RecordingsFeed";
import { requireAuth } from "@/lib/auth/helpers";
import { getPageContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import type { RecordingWithAuthor } from "@/lib/types/database";

export default async function RecordingsPage() {
  await requireAuth();
  const page = getPageContent("recordings");
  const supabase = await createClient();

  const { data } = await supabase
    .from("recordings")
    .select(
      `
      *,
      profiles ( id, name, photo_url ),
      recording_comments ( id, is_hidden )
    `
    )
    .order("created_at", { ascending: false });

  const recordings: RecordingWithAuthor[] = (data || []).map((row) => {
    const comments = (row.recording_comments || []) as {
      id: string;
      is_hidden: boolean;
    }[];
    return {
      id: row.id,
      profile_id: row.profile_id,
      title: row.title,
      description: row.description,
      source_type: row.source_type,
      storage_path: row.storage_path,
      external_url: row.external_url,
      transcript: row.transcript,
      tags: row.tags,
      created_at: row.created_at,
      updated_at: row.updated_at,
      profiles: row.profiles,
      comment_count: comments.filter((c) => !c.is_hidden).length,
    } as RecordingWithAuthor;
  });

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
          <RecordingsFeed
            recordings={recordings}
            emptyMessage={page.emptyMessage as string}
          />
        </div>
      </main>
    </div>
  );
}
