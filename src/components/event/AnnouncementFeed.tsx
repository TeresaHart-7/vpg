"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { postAnnouncement } from "@/lib/chat";
import { EditableMessage } from "@/components/messages/EditableMessage";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import type { MessageWithSender } from "@/lib/types/database";

type Props = {
  messages: MessageWithSender[];
  threadId: string | null;
  isAdmin: boolean;
  userId: string;
};

export function AnnouncementFeed({
  messages: initialMessages,
  threadId: initialThreadId,
  isAdmin,
  userId,
}: Props) {
  const router = useRouter();
  const [threadId, setThreadId] = useState(initialThreadId);
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const supabase = createClient();
      const newThreadId = await postAnnouncement(supabase, userId, body, threadId);
      if (!threadId && newThreadId) setThreadId(newThreadId);
      setBody("");
      router.refresh();
    } catch {
      setError("Could not post announcement. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card tint="peach">
          <form onSubmit={handlePost} className="space-y-4">
            <h2 className="text-display-sm">Post announcement</h2>
            <p className="text-body-sm text-ink-600">
              Everyone registered will get a notification.
            </p>
            <Textarea
              label="Message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share an update with the village…"
              maxLength={2000}
            />
            {error && <p className="text-body-sm text-error">{error}</p>}
            <Button type="submit" loading={posting} disabled={!body.trim()}>
              Publish
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-body-md text-ink-600">
            No announcements yet. Check back closer to the gathering.
          </p>
        ) : (
          messages.map((msg) => (
            <Card key={msg.id} tint="peach" className="animate-in fade-in">
              <EditableMessage
                message={msg}
                userId={userId}
                isOwn={msg.sender_id === userId}
                align="start"
                onUpdated={(updated) =>
                  setMessages((prev) =>
                    prev.map((m) => (m.id === updated.id ? updated : m))
                  )
                }
              />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
