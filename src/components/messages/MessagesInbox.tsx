"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markThreadRead } from "@/lib/thread-reads";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatMessageTime } from "@/lib/chat";
import type { PageContent } from "@/lib/content";
import type { Thread } from "@/lib/types/database";

type ThreadRow = Thread & {
  last_message?: string | null;
  last_message_at?: string | null;
  unread?: boolean;
};

type Props = {
  threads: ThreadRow[];
  userId: string;
  pageCopy: PageContent;
};

export function MessagesInbox({ threads, userId, pageCopy }: Props) {
  const router = useRouter();

  const chatThreads = threads.filter((t) => t.type !== "announcement");
  const announcements = threads.filter((t) => t.type === "announcement");

  async function handleMarkRead(threadId: string) {
    const supabase = createClient();
    await markThreadRead(supabase, userId, threadId);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link href="/event/chat/new?type=topic">
            <Button variant="secondary" size="sm">
              {pageCopy.newTopic as string}
            </Button>
          </Link>
          <Link href="/event/chat/new?type=dm">
            <Button variant="secondary" size="sm">
              {pageCopy.newDm as string}
            </Button>
          </Link>
        </div>

        {chatThreads.length === 0 ? (
          <p className="text-body-md text-ink-600">{pageCopy.emptyChat as string}</p>
        ) : (
          <ul className="space-y-3">
            {chatThreads.map((thread) => (
              <li key={thread.id}>
                <Card
                  tint={thread.unread ? "lavender" : "white"}
                  className="relative transition-transform hover:-translate-y-0.5"
                >
                  <Link href={`/event/chat/${thread.id}`} className="block">
                    <div className="flex items-start gap-3">
                      {thread.unread && (
                        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-error" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-body-md font-semibold text-ink-900">
                          {thread.title}
                        </h3>
                        {thread.last_message && (
                          <p className="mt-1 truncate text-body-sm text-ink-600">
                            {thread.last_message}
                          </p>
                        )}
                        {thread.last_message_at && (
                          <p className="mt-1 text-body-sm text-ink-600">
                            {formatMessageTime(thread.last_message_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  {thread.unread && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(thread.id)}
                      className="absolute right-4 top-4 text-body-sm text-plum-500 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-display-sm">{pageCopy.announcementsTitle as string}</h2>
        <p className="mt-1 text-body-sm text-ink-600">
          {pageCopy.announcementsSubtitle as string}
        </p>
        <ul className="mt-4 space-y-3">
          {announcements.length === 0 ? (
            <li className="text-body-md text-ink-600">No announcements yet.</li>
          ) : (
            announcements.map((thread) => (
              <li key={thread.id}>
                <Link href="/event/announcements">
                  <Card tint="peach" className="transition-transform hover:-translate-y-0.5">
                    <h3 className="text-body-md font-semibold text-ink-900">
                      {thread.title || "Announcements"}
                    </h3>
                    {thread.last_message && (
                      <p className="mt-1 truncate text-body-sm text-ink-600">
                        {thread.last_message}
                      </p>
                    )}
                  </Card>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
