import type { SupabaseClient } from "@supabase/supabase-js";
import type { CampMapContent } from "@/lib/types/database";

export async function findOrCreateDmThread(
  supabase: SupabaseClient,
  myUserId: string,
  otherUserId: string,
  otherName: string
) {
  const { data: existing } = await supabase
    .from("threads")
    .select("id, participant_ids")
    .eq("type", "dm");

  const match = existing?.find(
    (t) =>
      t.participant_ids?.length === 2 &&
      t.participant_ids.includes(myUserId) &&
      t.participant_ids.includes(otherUserId)
  );
  if (match) return match.id as string;

  const { data, error } = await supabase
    .from("threads")
    .insert({
      type: "dm",
      title: otherName,
      participant_ids: [myUserId, otherUserId],
      created_by: myUserId,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function createTopicThread(
  supabase: SupabaseClient,
  userId: string,
  title: string
) {
  const { data, error } = await supabase
    .from("threads")
    .insert({
      type: "topic_chat",
      title: title.trim(),
      participant_ids: [userId],
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function postAnnouncement(
  supabase: SupabaseClient,
  userId: string,
  body: string,
  existingThreadId?: string | null
) {
  let threadId = existingThreadId;

  if (!threadId) {
    const { data: thread, error: threadError } = await supabase
      .from("threads")
      .insert({
        type: "announcement",
        title: "Announcements",
        participant_ids: [],
        created_by: userId,
      })
      .select("id")
      .single();
    if (threadError) throw threadError;
    threadId = thread.id;
  }

  const { error } = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_id: userId,
    body: body.trim(),
  });
  if (error) throw error;
  return threadId;
}

export function parseCampMap(raw: string | null): CampMapContent | null {
  if (!raw?.trim()) return null;
  try {
    return JSON.parse(raw) as CampMapContent;
  } catch {
    return null;
  }
}

export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
