import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { AnnouncementFeed } from "@/components/event/AnnouncementFeed";
import { requireAuth, getCurrentProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { enrichMessages } from "@/lib/chat-server";
import type { Message } from "@/lib/types/database";

export default async function AnnouncementsPage() {
  const user = await requireAuth();
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: threads } = await supabase
    .from("threads")
    .select("id")
    .eq("type", "announcement")
    .order("created_at", { ascending: true })
    .limit(1);

  const threadId = threads?.[0]?.id ?? null;
  let messages: Message[] = [];

  if (threadId) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: false });
    messages = (data || []) as Message[];
  }

  const enriched = await enrichMessages(messages);

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Announcements</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Updates from the host crew — newest first.
        </p>
        <div className="mt-6">
          <EventSubnav />
        </div>
        <div className="mt-8">
          <AnnouncementFeed
            messages={enriched}
            threadId={threadId}
            isAdmin={!!profile?.is_admin}
            userId={user.id}
          />
        </div>
      </main>
    </div>
  );
}
