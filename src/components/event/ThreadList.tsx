"use client";

import Link from "next/link";
import { ChatCircle, Users, Megaphone } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatMessageTime } from "@/lib/chat";
import type { Thread, ThreadType } from "@/lib/types/database";

type ThreadRow = Thread & {
  last_message?: string | null;
  last_message_at?: string | null;
};

type Props = {
  threads: ThreadRow[];
  announcementHref: string;
};

const TYPE_META: Record<
  ThreadType,
  { label: string; icon: typeof ChatCircle; tint: "lavender" | "sage" | "peach" }
> = {
  topic_chat: { label: "Topic", icon: Users, tint: "sage" },
  dm: { label: "Direct", icon: ChatCircle, tint: "lavender" },
  announcement: { label: "Announcement", icon: Megaphone, tint: "peach" },
};

export function ThreadList({ threads, announcementHref }: Props) {
  const chatThreads = threads.filter((t) => t.type !== "announcement");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Link href="/event/chat/new?type=topic">
          <Button variant="secondary" size="sm">
            New topic
          </Button>
        </Link>
        <Link href="/event/chat/new?type=dm">
          <Button variant="secondary" size="sm">
            Message someone
          </Button>
        </Link>
        <Link href={announcementHref}>
          <Button variant="ghost" size="sm">
            View announcements
          </Button>
        </Link>
      </div>

      {chatThreads.length === 0 ? (
        <p className="text-body-md text-ink-600">
          No conversations yet. Start a topic thread or send a direct message.
        </p>
      ) : (
        <ul className="space-y-3">
          {chatThreads.map((thread) => {
            const meta = TYPE_META[thread.type];
            const Icon = meta.icon;
            return (
              <li key={thread.id}>
                <Link href={`/event/chat/${thread.id}`}>
                  <Card tint={meta.tint} className="transition-transform hover:-translate-y-0.5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-plum-600">
                        <Icon size={22} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-body-md font-semibold text-ink-900">
                            {thread.title}
                          </h3>
                          <span className="shrink-0 rounded-pill bg-white/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                            {meta.label}
                          </span>
                        </div>
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
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
