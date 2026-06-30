"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setConnectionStrength } from "@/lib/connections";
import type { ProfilePublic } from "@/lib/types/database";
import { formatDates } from "@/lib/types/database";
import { Card } from "@/components/ui/Card";
import { ComingBadge } from "@/components/ui/StatusBadge";
import { ConnectionStrength } from "@/components/ui/ConnectionStrength";
import { Avatar } from "@/components/directory/ParticipantCard";

type Props = {
  profile: ProfilePublic;
  myProfileId: string;
  userId: string;
  initialStrength: number;
  isOwnProfile: boolean;
};

export function ProfileBioView({
  profile,
  myProfileId,
  userId,
  initialStrength,
  isOwnProfile,
}: Props) {
  const router = useRouter();
  const [strength, setStrength] = useState(initialStrength);

  const handleConnectionChange = useCallback(
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
            <p className="mb-2 text-label text-ink-600">Your connection to {profile.name.split(" ")[0]}</p>
            <ConnectionStrength value={strength} onChange={handleConnectionChange} />
            <p className="mt-2 text-body-sm text-ink-600">
              Only you see this rating — it helps build the village network map.
            </p>
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
    </div>
  );
}
