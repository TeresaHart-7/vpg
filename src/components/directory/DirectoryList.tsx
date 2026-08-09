"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setConnectionStrength, buildConnectionMap } from "@/lib/connections";
import {
  CO_CREATION_DOMAINS,
  COMING_OPTIONS,
  OPERATIONAL_SHIFTS,
} from "@/lib/constants";
import type {
  ComingStatus,
  DirectoryProfile,
  LinkedGuestPublic,
} from "@/lib/types/database";
import type { PageContent } from "@/lib/content";
import { ParticipantCard, GuestCard } from "@/components/directory/ParticipantCard";
import { ConnectionCelebration } from "@/components/directory/ConnectionCelebration";
import { EmailFilteredAttendees } from "@/components/directory/EmailFilteredAttendees";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { SelectionPill } from "@/components/ui/SelectionPill";

type Props = {
  profiles: DirectoryProfile[];
  linkedGuests: LinkedGuestPublic[];
  myProfileId: string;
  userId: string;
  initialConnections: { profile_id_b: string; strength: number }[];
  pageCopy: PageContent;
};

type Entry =
  | { kind: "profile"; profile: DirectoryProfile }
  | { kind: "guest"; guest: LinkedGuestPublic };

function toggleInSet(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

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
  const [comingFilter, setComingFilter] = useState<ComingStatus | null>(null);
  const [coThinkingFilters, setCoThinkingFilters] = useState<string[]>([]);
  const [opsFilters, setOpsFilters] = useState<string[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const [connectionMap, setConnectionMap] = useState(
    () => buildConnectionMap(initialConnections)
  );

  const interestFiltersActive =
    coThinkingFilters.length > 0 || opsFilters.length > 0;
  const structuredFiltersActive =
    comingFilter !== null || interestFiltersActive;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const matchedProfiles = profiles.filter((p) => {
      if (q) {
        const hay = [
          p.name,
          p.location_from ?? "",
          p.bio ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (comingFilter !== null && p.is_coming !== comingFilter) return false;
      if (
        coThinkingFilters.length > 0 &&
        !coThinkingFilters.some((d) => p.co_creation_domains.includes(d))
      ) {
        return false;
      }
      if (
        opsFilters.length > 0 &&
        !opsFilters.some((s) => p.operational_shifts.includes(s))
      ) {
        return false;
      }
      return true;
    });

    const matchedGuests =
      structuredFiltersActive
        ? []
        : q
          ? linkedGuests.filter(
              (g) =>
                g.name.toLowerCase().includes(q) ||
                g.bio?.toLowerCase().includes(q) ||
                g.parent_name.toLowerCase().includes(q)
            )
          : linkedGuests;

    const entries: Entry[] = [
      ...matchedProfiles.map((profile) => ({
        kind: "profile" as const,
        profile,
      })),
      ...matchedGuests.map((guest) => ({ kind: "guest" as const, guest })),
    ];
    return entries.sort((a, b) => {
      const nameA = a.kind === "profile" ? a.profile.name : a.guest.name;
      const nameB = b.kind === "profile" ? b.profile.name : b.guest.name;
      return nameA.localeCompare(nameB);
    });
  }, [
    profiles,
    linkedGuests,
    search,
    comingFilter,
    coThinkingFilters,
    opsFilters,
    structuredFiltersActive,
  ]);

  const filteredEmails = useMemo(
    () =>
      filtered
        .filter((e): e is { kind: "profile"; profile: DirectoryProfile } => e.kind === "profile")
        .map((e) => e.profile.email)
        .filter(Boolean),
    [filtered]
  );

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

  const celebration = pageCopy.connectionCelebration as {
    title: string;
    body: string;
  };
  const connectionLevels = pageCopy.connectionLevels as {
    value: number;
    label: string;
  }[];

  return (
    <div className="space-y-6">
      <Input
        label="Search"
        placeholder="Name, location, or bio…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-5">
        <div>
          <p className="text-label mb-2 text-ink-600">Coming</p>
          <div className="flex flex-wrap gap-2">
            <SelectionPill
              selected={comingFilter === null}
              onClick={() => setComingFilter(null)}
            >
              Any
            </SelectionPill>
            {COMING_OPTIONS.map((opt) => (
              <SelectionPill
                key={opt.value}
                selected={comingFilter === opt.value}
                onClick={() =>
                  setComingFilter((prev) =>
                    prev === opt.value ? null : opt.value
                  )
                }
              >
                {opt.label}
              </SelectionPill>
            ))}
          </div>
        </div>

        <div>
          <p className="text-label mb-2 text-ink-600">Co-thinking interest</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CO_CREATION_DOMAINS.map((domain) => (
              <Checkbox
                key={domain.value}
                label={domain.shortLabel}
                checked={coThinkingFilters.includes(domain.value)}
                onChange={() =>
                  setCoThinkingFilters((prev) =>
                    toggleInSet(prev, domain.value)
                  )
                }
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-label mb-2 text-ink-600">Operational support</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {OPERATIONAL_SHIFTS.map((shift) => (
              <Checkbox
                key={shift.value}
                label={shift.label}
                checked={opsFilters.includes(shift.value)}
                onChange={() =>
                  setOpsFilters((prev) => toggleInSet(prev, shift.value))
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-body-sm text-ink-600">
          {filtered.length} {filtered.length === 1 ? "person" : "people"}
        </p>
        <EmailFilteredAttendees emails={filteredEmails} />
      </div>

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
        <p className="text-body-md text-ink-600">
          No matches for your filters.
        </p>
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
