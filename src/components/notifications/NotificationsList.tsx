"use client";

import { useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/lib/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Props = {
  notifications: AppNotification[];
};

function formatNotification(n: AppNotification) {
  const p = n.payload;
  switch (n.type) {
    case "reply":
      return {
        title: "Reply to your logistics post",
        body: `Someone replied to "${String(p.title || "your post")}"`,
        href: `/logistics?submission=${p.submission_id}`,
      };
    case "announcement":
      return {
        title: String(p.title || "Announcement"),
        body: String(p.body || ""),
        href: "#",
      };
    default:
      return {
        title: "Notification",
        body: String(p.body || JSON.stringify(p)),
        href: "#",
      };
  }
}

export function NotificationsList({ notifications: initial }: Props) {
  const markAllRead = useCallback(async () => {
    const supabase = createClient();
    const unread = initial.filter((n) => !n.read_at).map((n) => n.id);
    if (!unread.length) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unread);
    window.location.reload();
  }, [initial]);

  const hasUnread = initial.some((n) => !n.read_at);

  return (
    <div className="space-y-4">
      {hasUnread && (
        <Button variant="secondary" size="sm" onClick={markAllRead}>
          Mark all as read
        </Button>
      )}
      {initial.length === 0 ? (
        <Card tint="lavender">
          <p className="text-body-md text-ink-600">No notifications yet.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {initial.map((n) => {
            const { title, body, href } = formatNotification(n);
            const content = (
              <Card
                tint={n.read_at ? "white" : "lavender"}
                className={cn(!n.read_at && "ring-1 ring-lavender-300")}
              >
                <p className="text-display-sm">{title}</p>
                {body && <p className="mt-1 text-body-md text-ink-600">{body}</p>}
                <p className="mt-2 text-body-sm text-ink-600">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </Card>
            );
            return (
              <li key={n.id}>
                {href !== "#" ? (
                  <Link href={href} className="block">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
