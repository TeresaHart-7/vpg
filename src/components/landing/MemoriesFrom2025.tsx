const VIDEO_SRC = "/videos/memories-2025.mp4.mov";

export function MemoriesFrom2025() {
  return (
    <section className="border-t border-lavender-100 bg-cream-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-display-md text-lavender-800">Memories from 2025</h2>
        <p className="mt-2 text-body-md text-ink-600">
          A glimpse of last year&apos;s gathering — for returning villagers.
        </p>

        <div className="mt-6 overflow-hidden rounded-lg border border-lavender-100 bg-ink-900 shadow-soft">
          <video
            src={VIDEO_SRC}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full"
          >
            Your browser does not support embedded video.
          </video>
        </div>
      </div>
    </section>
  );
}
