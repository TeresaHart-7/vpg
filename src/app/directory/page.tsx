import { AppNav } from "@/components/layout/AppNav";
import { DirectoryView } from "@/components/directory/DirectoryView";
import { requireAuth, getCurrentProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import type { ProfilePublic } from "@/lib/types/database";

function buildGraphLinks(
  connections: { profile_id_a: string; profile_id_b: string; strength: number }[]
) {
  const pairStrength = new Map<string, number>();

  for (const c of connections) {
    const key = [c.profile_id_a, c.profile_id_b].sort().join(":");
    const existing = pairStrength.get(key) ?? 0;
    pairStrength.set(key, Math.max(existing, c.strength));
  }

  return [...pairStrength.entries()].map(([key, strength]) => {
    const [source, target] = key.split(":");
    return { source, target, strength };
  });
}

export default async function DirectoryPage() {
  const user = await requireAuth();
  const myProfile = await getCurrentProfile();
  if (!myProfile) return null;

  const supabase = await createClient();

  const [{ data: profiles }, { data: myConnections }, { data: allConnections }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, name, photo_url, bio, is_coming, dates, location_from, what_bringing_to_support, desires_for_gathering"
        )
        .neq("name", "")
        .order("name"),
      supabase
        .from("connections")
        .select("profile_id_b, strength")
        .eq("profile_id_a", myProfile.id)
        .eq("set_by_user_id", user.id),
      supabase
        .from("connections")
        .select("profile_id_a, profile_id_b, strength")
        .gt("strength", 0),
    ]);

  const publicProfiles = (profiles || []) as ProfilePublic[];
  const mapProfiles = publicProfiles.filter(
    (p) => p.is_coming === "yes" || p.is_coming === "maybe"
  );
  const mapIds = new Set(mapProfiles.map((p) => p.id));
  const graphLinks = buildGraphLinks(
    (allConnections || []).filter(
      (c) => mapIds.has(c.profile_id_a) && mapIds.has(c.profile_id_b)
    )
  );

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Directory</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Meet the village — browse profiles and map how you&apos;re connected.
        </p>
        <div className="mt-8">
          <DirectoryView
            profiles={publicProfiles}
            mapProfiles={mapProfiles}
            myProfileId={myProfile.id}
            userId={user.id}
            initialConnections={myConnections || []}
            graphLinks={graphLinks}
          />
        </div>
      </main>
    </div>
  );
}
