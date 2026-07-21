"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "@phosphor-icons/react";
import { formatTimestamp } from "@/lib/recordings/time";
import { cn } from "@/lib/utils";

type Tick = {
  id: string;
  seconds: number;
};

type Props = {
  src: string;
  ticks?: Tick[];
  onTimeUpdate?: (seconds: number) => void;
  onTickClick?: (id: string) => void;
  seekRequest?: { seconds: number; token: number } | null;
};

export function AudioPlayer({
  src,
  ticks = [],
  onTimeUpdate,
  onTickClick,
  seekRequest,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const labelId = useId();

  useEffect(() => {
    if (!seekRequest) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seekRequest.seconds;
    setCurrent(seekRequest.seconds);
  }, [seekRequest]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  function seekToRatio(ratio: number) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const next = Math.min(Math.max(ratio, 0), 1) * duration;
    audio.currentTime = next;
    setCurrent(next);
  }

  function skip(delta: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(
      Math.max(audio.currentTime + delta, 0),
      duration || audio.currentTime + delta
    );
  }

  const progress = duration > 0 ? current / duration : 0;

  return (
    <div className="space-y-3 rounded-lg bg-lavender-50 p-4">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setCurrent(t);
          onTimeUpdate?.(t);
        }}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => skip(-10)}
          className="rounded-full p-2 text-plum-600 hover:bg-white/60"
          aria-label="Back 10 seconds"
        >
          <SkipBack size={20} weight="fill" />
        </button>
        <button
          type="button"
          onClick={toggle}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-plum-500 text-white shadow-soft"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause size={24} weight="fill" />
          ) : (
            <Play size={24} weight="fill" className="ml-0.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => skip(10)}
          className="rounded-full p-2 text-plum-600 hover:bg-white/60"
          aria-label="Forward 10 seconds"
        >
          <SkipForward size={20} weight="fill" />
        </button>
        <div className="min-w-0 flex-1 text-body-sm font-semibold text-ink-700">
          <span id={labelId}>
            {formatTimestamp(current)} / {formatTimestamp(duration)}
          </span>
        </div>
      </div>

      <div className="relative pt-3">
        <div
          role="slider"
          tabIndex={0}
          aria-labelledby={labelId}
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration) || 0}
          aria-valuenow={Math.floor(current)}
          className="group relative h-2 cursor-pointer rounded-full bg-lavender-200"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seekToRatio((e.clientX - rect.left) / rect.width);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") skip(-5);
            if (e.key === "ArrowRight") skip(5);
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-plum-500"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-plum-700 opacity-0 shadow-soft transition-opacity group-hover:opacity-100"
            style={{ left: `${progress * 100}%` }}
          />
        </div>

        {ticks.length > 0 && duration > 0 && (
          <div className="relative mt-2 h-3">
            {ticks.map((tick) => (
              <button
                key={tick.id}
                type="button"
                title={formatTimestamp(tick.seconds)}
                onClick={() => onTickClick?.(tick.id)}
                className={cn(
                  "absolute top-0 h-3 w-1.5 -translate-x-1/2 rounded-full bg-peach-500",
                  "hover:scale-125"
                )}
                style={{
                  left: `${Math.min((tick.seconds / duration) * 100, 100)}%`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
