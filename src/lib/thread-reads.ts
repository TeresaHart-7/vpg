import type { SupabaseClient } from "@supabase/supabase-js";

export async function markThreadRead(
  supabase: SupabaseClient,
  userId: string,
  threadId: string
) {
  const { error } = await supabase.from("thread_read_state").upsert(
    {
      user_id: userId,
      thread_id: threadId,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,thread_id" }
  );
  if (error) throw error;
}

export async function getUnreadThreadIds(
  supabase: SupabaseClient,
  userId: string,
  threadIds: string[]
): Promise<Set<string>> {
  if (!threadIds.length) return new Set();

  const [{ data: reads }, { data: messages }] = await Promise.all([
    supabase
      .from("thread_read_state")
      .select("thread_id, last_read_at")
      .eq("user_id", userId)
      .in("thread_id", threadIds),
    supabase
      .from("messages")
      .select("thread_id, sender_id, created_at")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false }),
  ]);

  const readMap = new Map(
    (reads || []).map((r) => [r.thread_id, r.last_read_at as string])
  );

  const latestByThread = new Map<
    string,
    { created_at: string; sender_id: string }
  >();
  for (const msg of messages || []) {
    if (!latestByThread.has(msg.thread_id)) {
      latestByThread.set(msg.thread_id, {
        created_at: msg.created_at,
        sender_id: msg.sender_id,
      });
    }
  }

  const unread = new Set<string>();
  for (const [threadId, latest] of latestByThread) {
    if (latest.sender_id === userId) continue;
    const lastRead = readMap.get(threadId);
    if (!lastRead || new Date(latest.created_at) > new Date(lastRead)) {
      unread.add(threadId);
    }
  }

  return unread;
}
