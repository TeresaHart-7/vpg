"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setConnectionStrength } from "@/lib/connections";
import type { PageContent } from "@/lib/content";
import type { ProfilePublic } from "@/lib/types/database";
import { formatDates } from "@/lib/types/database";
import { Card } from "@/components/ui/Card";
import { ComingBadge } from "@/components/ui/StatusBadge";
import { ConnectionStrength } from "@/components/ui/ConnectionStrength";
import { ConnectionModal } from "@/components/directory/ConnectionModal";
import { ConnectionCelebration } from "@/components/directory/ConnectionCelebration";
import { Avatar } from "@/components/directory/ParticipantCard";

type Props = {
  profile: ProfilePublic;
  myProfileId: string;
  userId: string;
  initialStrength: number;
  isOwnProfile: boolean;
  pageCopy: PageContent;
};

export function ProfileBioView({
  profile,
  myProfileId,
  userId,
  initialStrength,
  isOwnProfile,
  pageCopy,
}: Props) {
  const router = useRouter();
  const [strength, setStrength] = useState(initialStrength);
  const [modalOpen, setModalOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const celebration = pageCopy.connectionCelebration as { title: string; body: string };
  const connectionLevels = pageCopy.connectionLevels as { value: number; label: string }[];

  const handleConnectionSave = useCallback(
    async (value: number) => {
      const prev = strength;
      setStrength(value);
      try {
        const supabase = createClient();
        await setConnectionStrength(
          supabase,
          myProfileId,
          profile.id,
          userId,
          value
        );
        router.refresh();
      } catch {
        setStrength(prev);
        throw new Error("Failed to save");
      }
    },
    [myProfileId, profile.id, router, strength, userId]
  );

  return (
    <div className="space-y-6">
      <Card tint="lavender">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar profile={profile} size="md" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-display-md">{profile.name}</h2>
              {profile.is_coming && <ComingBadge isComing={profile.is_coming} />}
            </div>
            {profile.location_from && (
              <p className="mt-1 text-body-md text-ink-600">{profile.location_from}</p>
            )}
            {profile.dates?.length ? (
              <p className="mt-2 text-body-sm text-ink-600">
                Dates: {formatDates(profile.dates)}
              </p>
            ) : null}
          </div>
        </div>

        {!isOwnProfile && (
          <div className="mt-6 border-t border-lavender-100 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <span className="text-label text-ink-600">
                Your connection to {profile.name.split(" ")[0]}
              </span>
              <ConnectionStrength value={strength} readOnly showNumber={strength > 0} />
            </button>
            <p className="mt-2 text-body-sm text-ink-600">
              {pageCopy.profileConnectionNote as string}
            </p>
            <ConnectionModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              personName={profile.name}
              initialStrength={strength}
              onSave={handleConnectionSave}
              onCelebration={() => setCelebrate(true)}
              intro={pageCopy.connectionModalIntro as string}
              levels={connectionLevels}
            />
          </div>
        )}
      </Card>

      {profile.bio && (
        <Card tint="white">
          <h3 className="text-display-sm">Bio</h3>
          <p className="mt-2 whitespace-pre-wrap text-body-md text-ink-900">{profile.bio}</p>
        </Card>
      )}

      {profile.what_bringing_to_support && (
        <Card tint="sage">
          <h3 className="text-display-sm">Bringing to support the village</h3>
          <p className="mt-2 whitespace-pre-wrap text-body-md text-ink-900">
            {profile.what_bringing_to_support}
          </p>
        </Card>
      )}

      {profile.desires_for_gathering && (
        <Card tint="peach">
          <h3 className="text-display-sm">Desires for this gathering</h3>
          <p className="mt-2 whitespace-pre-wrap text-body-md text-ink-900">
            {profile.desires_for_gathering}
          </p>
        </Card>
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
