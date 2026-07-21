"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ProfilePublic } from "@/lib/types/database";
import { NETWORK_STRENGTH_STYLE } from "@/components/directory/networkMapStyles";

const NetworkMapCanvas = dynamic(
  () => import("@/components/directory/NetworkMapCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center text-body-sm text-ink-600">
        Gathering the village…
      </div>
    ),
  }
);

type Props = {
  profiles: ProfilePublic[];
  links: { source: string; target: string; strength: number }[];
  onSelectProfile: (id: string) => void;
  currentProfileId?: string;
};

export function NetworkMap({
  profiles,
  links,
  onSelectProfile,
  currentProfileId,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 560 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      setDimensions({
        width: Math.max(320, width),
        height: Math.max(480, Math.min(640, width * 0.85)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (profiles.length === 0) {
    return (
      <p className="rounded-lg bg-lavender-50 p-8 text-center text-body-md text-ink-600">
        No participants to show on the map yet.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-lavender-100"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #F4F1FA 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, #E8F0E0 0%, transparent 50%), #FBF8F3",
      }}
    >
      <NetworkMapCanvas
        profiles={profiles}
        links={links}
        onSelectProfile={onSelectProfile}
        currentProfileId={currentProfileId}
        width={dimensions.width}
        height={dimensions.height}
      />

      <div className="pointer-events-none absolute bottom-14 left-4 rounded-lg bg-cream-50/90 px-3 py-2.5 shadow-sm backdrop-blur-sm">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-600">
          Connection strength
        </p>
        <ul className="space-y-1.5">
          {([1, 2, 3, 4] as const).map((level) => (
            <li key={level} className="flex items-center gap-2">
              <span
                className="block rounded-full"
                style={{
                  width: 28 + level * 4,
                  height: NETWORK_STRENGTH_STYLE[level].width,
                  backgroundColor: NETWORK_STRENGTH_STYLE[level].legend,
                  opacity: 0.45 + level * 0.13,
                }}
              />
              <span className="text-[11px] text-ink-600">{level}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="border-t border-lavender-100/80 bg-cream-50/70 px-4 py-3 text-body-sm text-ink-600 backdrop-blur-sm">
        Tap a person to view their profile. Curves thicken with stronger connections.
      </p>
    </div>
  );
}
