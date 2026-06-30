"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/lib/types/database";

type Props = {
  initialCount: number;
};

function notificationHref(n: AppNotification) {
  const payload = n.payload;
  if (n.type === "announcement") return "/event/announcements";
  if (payload.thread_id) return `/event/chat/${payload.thread_id}`;
  if (payload.submission_id) return `/logistics?submission=${payload.submission_id}`;
  if (payload.category) return "/logistics";
  return "/dashboard";
}

export function NotificationBell({ initialCount }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(initialCount);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);
    setItems((data || []) as AppNotification[]);
    setUnread((data || []).filter((n) => !n.read_at).length);
  }, []);

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("notifications")
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

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    load();
  }

  async function markAllRead() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null)
      .eq("user_id", user.id);
    load();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-lavender-50 hover:text-plum-500"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-peach-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-lavender-100 bg-white p-3 shadow-modal">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-body-sm font-semibold text-ink-900">
                Notifications
              </span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-body-sm text-plum-500 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {items.length === 0 ? (
                <li className="px-2 py-4 text-body-sm text-ink-600">
                  No notifications yet.
                </li>
              ) : (
                items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={notificationHref(n)}
                      onClick={() => {
                        if (!n.read_at) markRead(n.id);
                        setOpen(false);
                      }}
                      className={`block rounded-md px-2 py-2 text-body-sm hover:bg-lavender-50 ${
                        n.read_at ? "text-ink-600" : "bg-lavender-50/50 font-semibold text-ink-900"
                      }`}
                    >
                      <span className="capitalize">{n.type.replace("_", " ")}</span>
                      {typeof n.payload.preview === "string" && (
                        <span className="mt-0.5 block truncate font-normal text-ink-600">
                          {n.payload.preview}
                        </span>
                      )}
                      {typeof n.payload.title === "string" && !n.payload.preview && (
                        <span className="mt-0.5 block truncate font-normal text-ink-600">
                          {n.payload.title}
                        </span>
                      )}
                    </Link>
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
