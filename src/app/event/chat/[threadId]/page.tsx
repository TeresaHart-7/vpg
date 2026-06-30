import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { ChatView } from "@/components/event/ChatView";
import { requireAuth } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { enrichMessages } from "@/lib/chat-server";
import type { Message, Thread } from "@/lib/types/database";

type Props = {
  params: Promise<{ threadId: string }>;
};

export default async function ChatThreadPage({ params }: Props) {
  const { threadId } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: thread } = await supabase
    .from("threads")
    .select("*")
    .eq("id", threadId)
    .single();

  if (!thread) notFound();

  const row = thread as Thread;
  const canAccess =
    row.type === "topic_chat" ||
    row.type === "announcement" ||
    row.participant_ids.includes(user.id);

  if (!canAccess) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  const enriched = await enrichMessages((messages || []) as Message[]);
  const canPost =
    row.type === "topic_chat" ||
    row.type === "dm" ||
    (row.type === "announcement" && false);

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <Link
          href="/event/chat"
          className="text-body-sm font-semibold text-plum-500 hover:underline"
        >
          ← All chats
        </Link>
        <h1 className="mt-4 text-display-md">{row.title}</h1>
        <div className="mt-6">
          <ChatView
            threadId={threadId}
            userId={user.id}
            initialMessages={enriched}
            canPost={canPost}
          />
        </div>
      </main>
    </div>
  );
}
