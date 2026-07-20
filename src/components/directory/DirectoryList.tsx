"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setConnectionStrength, buildConnectionMap } from "@/lib/connections";
import type { LinkedGuestPublic, ProfilePublic } from "@/lib/types/database";
import type { PageContent } from "@/lib/content";
import { ParticipantCard, GuestCard } from "@/components/directory/ParticipantCard";
import { ConnectionCelebration } from "@/components/directory/ConnectionCelebration";
import { Input } from "@/components/ui/Input";

type Props = {
  profiles: ProfilePublic[];
  linkedGuests: LinkedGuestPublic[];
  myProfileId: string;
  userId: string;
  initialConnections: { profile_id_b: string; strength: number }[];
  pageCopy: PageContent;
};

type Entry =
  | { kind: "profile"; profile: ProfilePublic }
  | { kind: "guest"; guest: LinkedGuestPublic };

export function DirectoryList({
  profiles,
  linkedGuests,
  myProfileId,
  userId,
  initialConnections,
  pageCopy,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const [connectionMap, setConnectionMap] = useState(
    () => buildConnectionMap(initialConnections)
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matchedProfiles = q
      ? profiles.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.location_from?.toLowerCase().includes(q) ||
            p.bio?.toLowerCase().includes(q)
        )
      : profiles;
    const matchedGuests = q
      ? linkedGuests.filter(
          (g) =>
            g.name.toLowerCase().includes(q) ||
            g.bio?.toLowerCase().includes(q) ||
            g.parent_name.toLowerCase().includes(q)
        )
      : linkedGuests;

    const entries: Entry[] = [
      ...matchedProfiles.map((profile) => ({ kind: "profile" as const, profile })),
      ...matchedGuests.map((guest) => ({ kind: "guest" as const, guest })),
    ];
    return entries.sort((a, b) => {
      const nameA = a.kind === "profile" ? a.profile.name : a.guest.name;
      const nameB = b.kind === "profile" ? b.profile.name : b.guest.name;
      return nameA.localeCompare(nameB);
    });
  }, [profiles, linkedGuests, search]);

  const handleConnectionSave = useCallback(
    async (theirProfileId: string, strength: number) => {
      const prev = connectionMap.get(theirProfileId) ?? 0;
      setConnectionMap((m) => {
        const next = new Map(m);
        if (strength <= 0) next.delete(theirProfileId);
        else next.set(theirProfileId, strength);
        return next;
      });

      try {
        const supabase = createClient();
        await setConnectionStrength(
          supabase,
          myProfileId,
          theirProfileId,
          userId,
          strength
        );
        router.refresh();
      } catch {
        setConnectionMap((m) => {
          const next = new Map(m);
          if (prev <= 0) next.delete(theirProfileId);
          else next.set(theirProfileId, prev);
          return next;
        });
        throw new Error("Failed to save");
      }
    },
    [connectionMap, myProfileId, router, userId]
  );

  const celebration = pageCopy.connectionCelebration as { title: string; body: string };
  const connectionLevels = pageCopy.connectionLevels as { value: number; label: string }[];

  return (
    <div className="space-y-6">
      <Input
        label="Search"
        placeholder="Name, location, or bio…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <p className="text-body-sm text-ink-600">
        {filtered.length} {filtered.length === 1 ? "person" : "people"}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {filtered.map((entry) =>
          entry.kind === "profile" ? (
            <li key={entry.profile.id}>
              <ParticipantCard
                profile={entry.profile}
                href={`/directory/${entry.profile.id}`}
                connectionStrength={connectionMap.get(entry.profile.id) ?? 0}
                onConnectionSave={
                  entry.profile.id === myProfileId
                    ? undefined
                    : async (strength) => {
                        await handleConnectionSave(entry.profile.id, strength);
                      }
                }
                onConnectionCelebration={() => setCelebrate(true)}
                connectionIntro={pageCopy.connectionModalIntro as string}
                connectionLevels={connectionLevels}
              />
            </li>
          ) : (
            <li key={`guest-${entry.guest.id}`}>
              <GuestCard guest={entry.guest} />
            </li>
          )
        )}
      </ul>
      {filtered.length === 0 && (
        <p className="text-body-md text-ink-600">No matches for your search.</p>
      )}
      <ConnectionCelebration
        show={celebrate}
        onDone={() => setCelebrate(false)}
        title={celebration?.title}
        body={celebration?.body}
      />
    </div>
  );
}
