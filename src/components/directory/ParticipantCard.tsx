import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProfilePublic } from "@/lib/types/database";
import { ComingBadge } from "@/components/ui/StatusBadge";
import { ConnectionStrength } from "@/components/ui/ConnectionStrength";

type ParticipantCardProps = {
  profile: ProfilePublic;
  connectionStrength?: number;
  onConnectionChange?: (strength: number) => void;
  href?: string;
  compact?: boolean;
};

function Avatar({ profile, size }: { profile: ProfilePublic; size: "sm" | "md" }) {
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
  onConnectionChange,
  href,
  compact,
}: ParticipantCardProps) {
  const inner = (
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
        {onConnectionChange && (
          <div className="mt-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Your connection
            </p>
            <ConnectionStrength
              value={connectionStrength}
              onChange={onConnectionChange}
            />
          </div>
        )}
      </div>
    </>
  );

  const className = cn(
    "flex gap-4 rounded-lg p-4 shadow-soft transition-shadow hover:shadow-raised",
    compact ? "bg-white" : "bg-lavender-50"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

export { Avatar };
