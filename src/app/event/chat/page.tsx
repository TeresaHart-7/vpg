import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { ThreadList } from "@/components/event/ThreadList";
import { requireAuth } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import type { Thread } from "@/lib/types/database";

export default async function ChatIndexPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: threads } = await supabase
    .from("threads")
    .select("*")
    .in("type", ["topic_chat", "dm"])
    .order("updated_at", { ascending: false });

  const visible = ((threads || []) as Thread[]).filter(
    (t) => t.type === "topic_chat" || t.participant_ids.includes(user.id)
  );

  const threadIds = visible.map((t) => t.id);
  const lastByThread = new Map<string, { body: string; created_at: string }>();

  if (threadIds.length) {
    const { data: recent } = await supabase
      .from("messages")
      .select("thread_id, body, created_at")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false });

    for (const msg of recent || []) {
      if (!lastByThread.has(msg.thread_id)) {
        lastByThread.set(msg.thread_id, {
          body: msg.body,
          created_at: msg.created_at,
        });
      }
    }
  }

  const enriched = visible.map((t) => {
    const last = lastByThread.get(t.id);
    return {
      ...t,
      last_message: last?.body ?? null,
      last_message_at: last?.created_at ?? null,
    };
  });

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Chat</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Topic threads and direct messages with other participants.
        </p>
        <div className="mt-6">
          <EventSubnav />
        </div>
        <div className="mt-8">
          <ThreadList
            threads={enriched}
            announcementHref="/event/announcements"
          />
        </div>
      </main>
    </div>
  );
}
