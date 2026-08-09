import { AppNav } from "@/components/layout/AppNav";
import { DirectoryView } from "@/components/directory/DirectoryView";
import { requireAuth, getCurrentProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { getPageContent } from "@/lib/content";
import type {
  DirectoryProfile,
  LinkedGuestPublic,
  ProfilePublic,
} from "@/lib/types/database";

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

  const [
    { data: profiles },
    { data: guests },
    { data: myConnections },
    { data: allConnections },
    { data: coCreation },
    { data: operational },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, name, email, photo_url, bio, is_coming, dates, location_from, what_bringing_to_support, desires_for_gathering"
      )
      .neq("name", "")
      .order("name"),
    supabase
      .from("linked_guests")
      .select("id, name, photo_url, bio, parent_profile_id")
      .eq("is_claimed", false)
      .neq("name", ""),
    supabase
      .from("connections")
      .select("profile_id_b, strength")
      .eq("profile_id_a", myProfile.id)
      .eq("set_by_user_id", user.id),
    supabase
      .from("connections")
      .select("profile_id_a, profile_id_b, strength")
      .gt("strength", 0),
    supabase.from("co_creation_interests").select("profile_id, domain"),
    supabase.from("operational_shifts").select("profile_id, shift_type"),
  ]);

  const domainsByProfile = new Map<string, string[]>();
  for (const row of coCreation || []) {
    const list = domainsByProfile.get(row.profile_id) ?? [];
    list.push(row.domain);
    domainsByProfile.set(row.profile_id, list);
  }

  const shiftsByProfile = new Map<string, string[]>();
  for (const row of operational || []) {
    const list = shiftsByProfile.get(row.profile_id) ?? [];
    list.push(row.shift_type);
    shiftsByProfile.set(row.profile_id, list);
  }

  const directoryProfiles: DirectoryProfile[] = (profiles || []).map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email ?? "",
    photo_url: p.photo_url,
    bio: p.bio,
    is_coming: p.is_coming,
    dates: p.dates,
    location_from: p.location_from,
    what_bringing_to_support: p.what_bringing_to_support,
    desires_for_gathering: p.desires_for_gathering,
    co_creation_domains: domainsByProfile.get(p.id) ?? [],
    operational_shifts: shiftsByProfile.get(p.id) ?? [],
  }));

  const mapProfiles = directoryProfiles.filter(
    (p) => p.is_coming === "yes" || p.is_coming === "maybe"
  ) as ProfilePublic[];

  // Guests inherit visibility from their parent: only listed when the parent
  // is in the directory and coming (yes/maybe).
  const comingProfileById = new Map(mapProfiles.map((p) => [p.id, p]));
  const linkedGuests: LinkedGuestPublic[] = (guests || []).flatMap((g) => {
    const parent = comingProfileById.get(g.parent_profile_id);
    if (!parent) return [];
    return [
      {
        id: g.id,
        name: g.name,
        photo_url: g.photo_url,
        bio: g.bio,
        parent_profile_id: g.parent_profile_id,
        parent_name: parent.name,
      },
    ];
  });
  const mapIds = new Set(mapProfiles.map((p) => p.id));
  const graphLinks = buildGraphLinks(
    (allConnections || []).filter(
      (c) => mapIds.has(c.profile_id_a) && mapIds.has(c.profile_id_b)
    )
  );

  const pageCopy = getPageContent("participants");

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">{pageCopy.title as string}</h1>
        <p className="mt-2 text-body-md text-ink-600">{pageCopy.subtitle as string}</p>
        <div className="mt-8">
          <DirectoryView
            profiles={directoryProfiles}
            linkedGuests={linkedGuests}
            mapProfiles={mapProfiles}
            myProfileId={myProfile.id}
            userId={user.id}
            initialConnections={myConnections || []}
            graphLinks={graphLinks}
            pageCopy={pageCopy}
          />
        </div>
      </main>
    </div>
  );
}
