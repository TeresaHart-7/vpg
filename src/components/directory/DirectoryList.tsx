"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
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
  const filtersActive = comingFilter !== null || interestFiltersActive;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const interestValues = [...coThinkingFilters, ...opsFilters];

    const matchedProfiles = profiles.filter((p) => {
      if (q) {
        const hay = [p.name, p.location_from ?? "", p.bio ?? ""]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // RSVP ANDs with interests; all interest checkboxes OR together
      if (comingFilter !== null && p.is_coming !== comingFilter) return false;
      if (interestValues.length > 0) {
        const matchesInterest = interestValues.some(
          (v) =>
            p.co_creation_domains.includes(v) ||
            p.operational_shifts.includes(v)
        );
        if (!matchesInterest) return false;
      }
      return true;
    });

    // Guests inherit RSVP from their parent. They have no interest tags, so
    // hide them when co-thinking / ops filters are active.
    const matchedGuests = interestFiltersActive
      ? []
      : linkedGuests.filter((g) => {
          if (comingFilter !== null && g.parent_is_coming !== comingFilter) {
            return false;
          }
          if (!q) return true;
          return (
            g.name.toLowerCase().includes(q) ||
            g.bio?.toLowerCase().includes(q) ||
            g.parent_name.toLowerCase().includes(q)
          );
        });

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
    interestFiltersActive,
  ]);

  const filteredEmails = useMemo(
    () =>
      filtered
        .filter(
          (e): e is { kind: "profile"; profile: DirectoryProfile } =>
            e.kind === "profile"
        )
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

      <details className="group rounded-md border border-lavender-100 bg-white/60 open:bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-body-sm text-ink-600 marker:content-none [&::-webkit-details-marker]:hidden hover:text-plum-500">
          <CaretDown
            size={14}
            weight="bold"
            className="shrink-0 transition-transform group-open:rotate-180"
            aria-hidden
          />
          <span>Filter by</span>
          {filtersActive && (
            <span className="text-label text-plum-500">· active</span>
          )}
        </summary>
        <div className="space-y-4 border-t border-lavender-100 px-3 py-4">
          <div>
            <p className="text-label mb-2 text-ink-600">RSVP</p>
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

          <div
            className="flex items-center gap-3"
            role="separator"
            aria-label="and"
          >
            <div className="h-px flex-1 bg-lavender-100" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
              and
            </span>
            <div className="h-px flex-1 bg-lavender-100" />
          </div>

          <div className="rounded-md border border-lavender-100/80 bg-cream-50/50 px-3 py-3">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-label text-ink-600">Interests</p>
              <p className="text-[11px] text-ink-500">Match any of these</p>
            </div>

            <div>
              <p className="mb-2 text-body-sm font-semibold text-ink-600">
                Co-thinking
              </p>
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

            <div
              className="my-3 flex items-center gap-3"
              role="separator"
              aria-label="or"
            >
              <div className="h-px flex-1 bg-lavender-100" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                or
              </span>
              <div className="h-px flex-1 bg-lavender-100" />
            </div>

            <div>
              <p className="mb-2 text-body-sm font-semibold text-ink-600">
                Operational support
              </p>
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

          <EmailFilteredAttendees emails={filteredEmails} />
        </div>
      </details>

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
