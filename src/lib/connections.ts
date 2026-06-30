import type { SupabaseClient } from "@supabase/supabase-js";

export async function setConnectionStrength(
  supabase: SupabaseClient,
  myProfileId: string,
  theirProfileId: string,
  userId: string,
  strength: number
) {
  if (myProfileId === theirProfileId) return;

  if (strength <= 0) {
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("profile_id_a", myProfileId)
      .eq("profile_id_b", theirProfileId)
      .eq("set_by_user_id", userId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("connections").upsert(
    {
      profile_id_a: myProfileId,
      profile_id_b: theirProfileId,
      strength,
      set_by_user_id: userId,
    },
    { onConflict: "profile_id_a,profile_id_b,set_by_user_id" }
  );
  if (error) throw error;
}

export function buildConnectionMap(
  connections: { profile_id_b: string; strength: number }[]
) {
  return new Map(connections.map((c) => [c.profile_id_b, c.strength]));
}
