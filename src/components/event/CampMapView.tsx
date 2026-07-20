"use client";

import Image from "next/image";
import type { CampMapContent } from "@/lib/types/database";

type Props = {
  map: CampMapContent;
};

export function CampMapView({ map }: Props) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-lavender-200 bg-white shadow-soft">
        <Image
          src={map.imageUrl}
          alt="Camp Ki-Wa-Y site map"
          width={0}
          height={0}
          sizes="(max-width: 1024px) 100vw, 896px"
          className="h-auto w-full"
          style={{ width: "100%", height: "auto" }}
          priority
        />
      </div>
      {map.caption && (
        <p className="text-body-sm text-ink-600">{map.caption}</p>
      )}
      <p className="text-body-sm text-ink-600">
        Pinch to zoom on mobile. This map is cached for offline viewing once loaded.
      </p>
    </div>
  );
}
