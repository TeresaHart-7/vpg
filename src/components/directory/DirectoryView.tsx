"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DirectoryList } from "@/components/directory/DirectoryList";
import { NetworkMap } from "@/components/directory/NetworkMap";
import type { ProfilePublic } from "@/lib/types/database";

type View = "list" | "map";

type Props = {
  profiles: ProfilePublic[];
  mapProfiles: ProfilePublic[];
  myProfileId: string;
  userId: string;
  initialConnections: { profile_id_b: string; strength: number }[];
  graphLinks: { source: string; target: string; strength: number }[];
  initialView?: View;
};

export function DirectoryView({
  profiles,
  mapProfiles,
  myProfileId,
  userId,
  initialConnections,
  graphLinks,
  initialView = "list",
}: Props) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialView);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-pill bg-lavender-50 p-1">
        {(["list", "map"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setView(tab)}
            className={cn(
              "flex-1 rounded-pill px-4 py-2 text-body-sm font-semibold transition-colors",
              view === tab
                ? "bg-white text-plum-700 shadow-soft"
                : "text-ink-600 hover:text-plum-500"
            )}
          >
            {tab === "list" ? "List" : "Network map"}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <DirectoryList
          profiles={profiles}
          myProfileId={myProfileId}
          userId={userId}
          initialConnections={initialConnections}
        />
      ) : (
        <NetworkMap
          profiles={mapProfiles}
          links={graphLinks}
          onSelectProfile={(id) => router.push(`/directory/${id}`)}
        />
      )}
    </div>
  );
}
