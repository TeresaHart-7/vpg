"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMessageTime } from "@/lib/chat";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { MessageWithSender } from "@/lib/types/database";

type Props = {
  threadId: string;
  userId: string;
  initialMessages: MessageWithSender[];
  canPost: boolean;
};

export function ChatView({
  threadId,
  userId,
  initialMessages,
  canPost,
}: Props) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        async (payload) => {
          const row = payload.new as {
            id: string;
            thread_id: string;
            sender_id: string;
            body: string;
            created_at: string;
          };

          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("user_id", row.sender_id)
            .single();

          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [
              ...prev,
              {
                ...row,
                sender_name: profile?.name ?? "Someone",
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!body.trim() || !canPost) return;
      setSending(true);
      setError(null);
      try {
        const supabase = createClient();
        const { error: insertError } = await supabase.from("messages").insert({
          thread_id: threadId,
          sender_id: userId,
          body: body.trim(),
        });
        if (insertError) throw insertError;
        setBody("");
        router.refresh();
      } catch {
        setError("Message not sent. Check your connection and try again.");
      } finally {
        setSending(false);
      }
    },
    [body, canPost, router, threadId, userId]
  );

  return (
    <div className="flex min-h-[50vh] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <p className="text-body-md text-ink-600">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === userId;
            return (
              <div
                key={msg.id}
                className={cn("flex", isOwn ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-md px-4 py-3",
                    isOwn
                      ? "rounded-br-sm bg-plum-100 text-ink-900"
                      : "rounded-bl-sm bg-cream-100 text-ink-900"
                  )}
                >
                  {!isOwn && (
                    <p className="mb-1 text-body-sm font-semibold text-plum-700">
                      {msg.sender_name}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-body-md">{msg.body}</p>
                  <p className="mt-1 text-[11px] text-ink-600">
                    {formatMessageTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {canPost ? (
        <form onSubmit={sendMessage} className="sticky bottom-0 border-t border-lavender-100 bg-cream-50 pt-4">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a message…"
            maxLength={2000}
            className="min-h-[88px]"
          />
          {error && <p className="mt-2 text-body-sm text-error">{error}</p>}
          <Button
            type="submit"
            className="mt-3"
            loading={sending}
            disabled={!body.trim()}
          >
            Send
          </Button>
        </form>
      ) : (
        <p className="border-t border-lavender-100 pt-4 text-body-sm text-ink-600">
          Only hosts can post announcements here.
        </p>
      )}
    </div>
  );
}
