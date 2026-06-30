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
        <div className="relative aspect-[4/3] w-full touch-pan-x touch-pinch-zoom">
          <Image
            src={map.imageUrl}
            alt="Camp Ki-Wa-Y site map"
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 640px"
            priority
          />
        </div>
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
