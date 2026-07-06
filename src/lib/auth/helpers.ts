import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data as Profile | null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) redirect("/dashboard");
  return profile;
}

export async function getUnreadAnnouncementCount(): Promise<number> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("type", "announcement")
    .is("read_at", null);

  return count ?? 0;
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data: threads } = await supabase
    .from("threads")
    .select("id, type, participant_ids")
    .in("type", ["topic_chat", "dm"]);

  const visible = (threads || []).filter(
    (t) => t.type === "topic_chat" || t.participant_ids?.includes(userId)
  );
  const ids = visible.map((t) => t.id);
  if (!ids.length) return 0;

  const { getUnreadThreadIds } = await import("@/lib/thread-reads");
  const unread = await getUnreadThreadIds(supabase, userId, ids);
  return unread.size;
}

import { getSiteContentBlock } from "@/lib/content";

export async function getContentBlock(key: string): Promise<string | null> {
  return getSiteContentBlock(key);
}

/** Strip private fields when viewing another participant's profile */
export function toPublicProfile(profile: Profile) {
  return {
    id: profile.id,
    name: profile.name,
    photo_url: profile.photo_url,
    bio: profile.bio,
    is_coming: profile.is_coming,
    dates: profile.dates,
    location_from: profile.location_from,
    what_bringing_to_support: profile.what_bringing_to_support,
    desires_for_gathering: profile.desires_for_gathering,
  };
}
