"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LinkedGuestPublic, ProfilePublic } from "@/lib/types/database";
import { ComingBadge } from "@/components/ui/StatusBadge";
import { ConnectionStrength } from "@/components/ui/ConnectionStrength";
import { ConnectionModal } from "@/components/directory/ConnectionModal";

type ParticipantCardProps = {
  profile: ProfilePublic;
  connectionStrength?: number;
  onConnectionSave?: (strength: number) => Promise<void>;
  onConnectionCelebration?: () => void;
  connectionIntro?: string;
  connectionLevels?: { value: number; label: string }[];
  href?: string;
  compact?: boolean;
};

function Avatar({
  profile,
  size,
}: {
  profile: Pick<ProfilePublic, "name" | "photo_url">;
  size: "sm" | "md";
}) {
  const dim = size === "sm" ? 40 : 56;
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (profile.photo_url) {
    return (
      <Image
        src={profile.photo_url}
        alt=""
        width={dim}
        height={dim}
        className={cn(
          "rounded-full object-cover",
          size === "sm" ? "h-10 w-10" : "h-14 w-14"
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-lavender-100 font-display font-semibold text-lavender-800",
        size === "sm" ? "h-10 w-10 text-body-sm" : "h-14 w-14 text-body-md"
      )}
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
}

export function ParticipantCard({
  profile,
  connectionStrength = 0,
  onConnectionSave,
  onConnectionCelebration,
  connectionIntro,
  connectionLevels,
  href,
  compact,
}: ParticipantCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const profileBody = (
    <>
      <Avatar profile={profile} size={compact ? "sm" : "md"} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-display-sm">{profile.name || "Unnamed"}</h3>
          {profile.is_coming && <ComingBadge isComing={profile.is_coming} />}
        </div>
        {profile.location_from && (
          <p className="mt-0.5 truncate text-body-sm text-ink-600">
            {profile.location_from}
          </p>
        )}
        {!compact && profile.bio && (
          <p className="mt-2 line-clamp-2 text-body-sm text-ink-600">{profile.bio}</p>
        )}
      </div>
    </>
  );

  const className = cn(
    "rounded-lg p-4 shadow-soft transition-shadow hover:shadow-raised",
    compact ? "bg-white" : "bg-lavender-50"
  );

  return (
    <div className={className}>
      {href ? (
        <Link href={href} className="flex gap-4">
          {profileBody}
        </Link>
      ) : (
        <div className="flex gap-4">{profileBody}</div>
      )}

      {onConnectionSave && (
        <div className="mt-3 border-t border-lavender-100 pt-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Your connection
            </span>
            <ConnectionStrength
              value={connectionStrength}
              readOnly
              showNumber={connectionStrength > 0}
            />
          </button>
          <ConnectionModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            personName={profile.name}
            initialStrength={connectionStrength}
            onSave={onConnectionSave}
            onCelebration={onConnectionCelebration}
            intro={connectionIntro}
            levels={connectionLevels}
          />
        </div>
      )}
    </div>
  );
}

export function GuestCard({ guest }: { guest: LinkedGuestPublic }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-soft">
      <div className="flex gap-4">
        <Avatar profile={guest} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-display-sm">{guest.name}</h3>
            <span className="inline-flex rounded-pill bg-cream-100 px-3 py-1 text-label text-ink-600">
              Guest
            </span>
          </div>
          {guest.parent_name && (
            <p className="mt-0.5 truncate text-body-sm text-ink-600">
              Coming with {guest.parent_name}
            </p>
          )}
          {guest.bio && (
            <p className="mt-2 line-clamp-2 text-body-sm text-ink-600">{guest.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export { Avatar };
