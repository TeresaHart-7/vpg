"use client";

import { useMemo } from "react";
import {
  activeSegmentIndex,
  hasTimedTranscript,
  parseTranscript,
} from "@/lib/recordings/transcript";
import { formatTimestamp } from "@/lib/recordings/time";
import { cn } from "@/lib/utils";

type Props = {
  transcript: string;
  currentTime?: number;
  syncEnabled?: boolean;
  onSeek?: (seconds: number) => void;
};

export function TranscriptView({
  transcript,
  currentTime = 0,
  syncEnabled = false,
  onSeek,
}: Props) {
  const segments = useMemo(() => parseTranscript(transcript), [transcript]);
  const timed = hasTimedTranscript(segments);
  const active = syncEnabled && timed ? activeSegmentIndex(segments, currentTime) : -1;

  return (
    <section className="space-y-3">
      <h2 className="text-display-sm">Transcript</h2>
      {timed && syncEnabled ? (
        <p className="text-body-sm text-ink-600">
          Highlights follow playback. Tap a timed paragraph to jump there.
        </p>
      ) : (
        <p className="text-body-sm text-ink-600">Shared by the recording author.</p>
      )}
      <div className="space-y-2">
        {segments.map((seg, i) => {
          const clickable = syncEnabled && seg.startSeconds !== null && onSeek;
          return (
            <button
              key={i}
              type="button"
              disabled={!clickable}
              onClick={() => {
                if (seg.startSeconds !== null) onSeek?.(seg.startSeconds);
              }}
              className={cn(
                "block w-full rounded-md px-3 py-2 text-left text-body-md text-ink-800",
                clickable && "hover:bg-lavender-50",
                active === i && "bg-lavender-50 ring-1 ring-plum-200"
              )}
            >
              {seg.startSeconds !== null && (
                <span className="mr-2 text-body-sm font-semibold text-plum-600">
                  [{formatTimestamp(seg.startSeconds)}]
                </span>
              )}
              {seg.text}
            </button>
          );
        })}
      </div>
    </section>
  );
}
