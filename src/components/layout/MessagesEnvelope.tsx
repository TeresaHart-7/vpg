"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EnvelopeSimple, Megaphone } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { getUnreadThreadIds, markThreadRead } from "@/lib/thread-reads";
import type { Thread } from "@/lib/types/database";

type Props = {
  userId: string;
  initialUnreadCount: number;
  initialAnnouncementUnread?: number;
};

export function MessagesEnvelope({
  userId,
  initialUnreadCount,
  initialAnnouncementUnread = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(
    initialUnreadCount + initialAnnouncementUnread
  );
  const [announcementUnread, setAnnouncementUnread] = useState(
    initialAnnouncementUnread
  );
  const [threads, setThreads] = useState<
    (Thread & { last_message?: string | null; unread?: boolean; isAnnouncement?: boolean })[]
  >([]);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: raw } = await supabase
      .from("threads")
      .select("*")
      .in("type", ["topic_chat", "dm", "announcement"])
      .order("updated_at", { ascending: false })
      .limit(15);

    const visible = ((raw || []) as Thread[]).filter(
      (t) =>
        t.type === "topic_chat" ||
        t.type === "announcement" ||
        t.participant_ids.includes(userId)
    );

    const chatIds = visible.filter((t) => t.type !== "announcement").map((t) => t.id);
    const unreadSet = await getUnreadThreadIds(supabase, userId, chatIds);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    let announcementUnread = 0;
    if (user) {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("type", "announcement")
        .is("read_at", null);
      announcementUnread = count ?? 0;
    }

    const enriched = await Promise.all(
      visible.map(async (t) => {
        const { data: msgs } = await supabase
          .from("messages")
          .select("body")
          .eq("thread_id", t.id)
          .order("created_at", { ascending: false })
          .limit(1);
        return {
          ...t,
          last_message: msgs?.[0]?.body ?? null,
          unread: t.type !== "announcement" && unreadSet.has(t.id),
          isAnnouncement: t.type === "announcement",
        };
      })
    );

    setThreads(enriched);
    setAnnouncementUnread(announcementUnread);
    setUnreadCount(unreadSet.size + announcementUnread);
  }, [userId]);

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("messages-envelope")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  async function dismissThread(threadId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const supabase = createClient();
    await markThreadRead(supabase, userId, threadId);
    load();
  }

  async function markAnnouncementsRead() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null)
      .eq("user_id", user.id)
      .eq("type", "announcement");
    load();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-lavender-50 hover:text-plum-500"
        aria-label={`Messages${unreadCount ? `, ${unreadCount} unread` : ""}`}
      >
        <EnvelopeSimple size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close messages"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-lavender-100 bg-white p-3 shadow-modal">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-body-sm font-semibold text-ink-900">
                Messages & announcements
              </span>
              <Link
                href="/messages"
                onClick={() => setOpen(false)}
                className="text-body-sm text-plum-500 hover:underline"
              >
                See all
              </Link>
            </div>
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {threads.length === 0 ? (
                <li className="px-2 py-4 text-body-sm text-ink-600">No messages yet.</li>
              ) : (
                threads.map((t) => (
                  <li key={t.id} className="group relative">
                    <Link
                      href={
                        t.isAnnouncement
                          ? "/messages/announcements"
                          : `/messages/chat/${t.id}`
                      }
                      onClick={() => {
                        if (t.isAnnouncement) void markAnnouncementsRead();
                        setOpen(false);
                      }}
                      className={`block rounded-md px-2 py-2 pr-16 text-body-sm hover:bg-lavender-50 ${
                        t.unread || (t.isAnnouncement && announcementUnread > 0)
                          ? "font-semibold text-ink-900"
                          : "text-ink-600"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {t.isAnnouncement ? (
                          <Megaphone size={14} className="shrink-0 text-peach-600" />
                        ) : (
                          t.unread && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-error" />
                          )
                        )}
                        {t.title || (t.isAnnouncement ? "Announcements" : "Conversation")}
                      </span>
                      {t.last_message && (
                        <span className="mt-0.5 block truncate font-normal text-ink-600">
                          {t.last_message}
                        </span>
                      )}
                    </Link>
                    {t.unread && !t.isAnnouncement && (
                      <button
                        type="button"
                        onClick={(e) => dismissThread(t.id, e)}
                        className="absolute right-2 top-2 text-[11px] text-plum-500 opacity-0 hover:underline group-hover:opacity-100"
                      >
                        Mark read
                      </button>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
