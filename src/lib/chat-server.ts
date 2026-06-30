import { createClient } from "@/lib/supabase/server";
import type { Message, MessageWithSender } from "@/lib/types/database";

export async function enrichMessages(
  messages: Message[]
): Promise<MessageWithSender[]> {
  if (!messages.length) return [];
  const supabase = await createClient();
  const senderIds = [...new Set(messages.map((m) => m.sender_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, name")
    .in("user_id", senderIds);

  const nameByUser = new Map(
    (profiles || []).map((p) => [p.user_id, p.name as string])
  );

  return messages.map((m) => ({
    ...m,
    sender_name: nameByUser.get(m.sender_id) ?? "Someone",
  }));
}
