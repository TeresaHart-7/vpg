"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markThreadRead } from "@/lib/thread-reads";
import { EditableMessage } from "@/components/messages/EditableMessage";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
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
    void markThreadRead(supabase, userId, threadId);
  }, [threadId, userId]);

  const enrichSender = useCallback(async (senderId: string) => {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", senderId)
      .single();
    return profile?.name ?? "Someone";
  }, []);

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
          const row = payload.new as MessageWithSender;
          const sender_name = await enrichSender(row.sender_id);
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, { ...row, sender_name }];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const row = payload.new as MessageWithSender;
          setMessages((prev) =>
            prev.map((m) => (m.id === row.id ? { ...m, ...row } : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, enrichSender]);

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
          messages.map((msg) => (
            <EditableMessage
              key={msg.id}
              message={msg}
              userId={userId}
              isOwn={msg.sender_id === userId}
              align={msg.sender_id === userId ? "end" : "start"}
              onUpdated={(updated) =>
                setMessages((prev) =>
                  prev.map((m) => (m.id === updated.id ? updated : m))
                )
              }
            />
          ))
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
