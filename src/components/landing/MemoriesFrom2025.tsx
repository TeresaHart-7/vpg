import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { existsSync } from "fs";
import path from "path";

const ALBUM_URL = "https://photos.app.goo.gl/gpSM6xkp786DJrrD9";
const THUMBNAIL_URL =
  "https://lh3.googleusercontent.com/pw/AP1GczMqvbiG-4PxUrfh3TEpBPvDhJW4xiN2Vve6ATte32n9JNyHiHOcwmyDg2T0nR1WqoDK5bxhBa3W8yLcVshph6WVLMVSWylA_NjssS3LgE3NRcHs5zXU=w960-h540-no";
const LOCAL_VIDEO = "/videos/memories-2025.mp4";

function hasLocalVideo() {
  return existsSync(path.join(process.cwd(), "public", "videos", "memories-2025.mp4"));
}

export function MemoriesFrom2025() {
  const localVideo = hasLocalVideo();

  return (
    <section className="border-t border-lavender-100 bg-cream-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-display-md text-lavender-800">Memories from 2025</h2>
        <p className="mt-2 text-body-md text-ink-600">
          A glimpse of last year&apos;s gathering — for returning villagers.
        </p>

        {localVideo ? (
          <div className="mt-6 overflow-hidden rounded-lg border border-lavender-100 bg-ink-900 shadow-soft">
            <video
              src={LOCAL_VIDEO}
              controls
              playsInline
              preload="metadata"
              poster={THUMBNAIL_URL}
              className="aspect-video w-full"
            >
              <track kind="captions" />
            </video>
          </div>
        ) : (
          <Link
            href={ALBUM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 block"
            aria-label="Watch memories from 2025 on Google Photos"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg border border-lavender-100 bg-ink-900 shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={THUMBNAIL_URL}
                alt="Video thumbnail from the 2025 Village Playground gathering"
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink-900/35 transition-colors group-hover:bg-ink-900/45">
                <span className="flex items-center gap-2 rounded-pill bg-cream-50/95 px-5 py-2.5 text-body-sm font-semibold text-plum-700 shadow-soft">
                  <Play size={20} weight="fill" />
                  Watch video
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
