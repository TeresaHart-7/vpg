const YOUTUBE_EMBED = "https://www.youtube.com/embed/A3rYMtPL5hg";

export function MemoriesFrom2025() {
  return (
    <section className="border-t border-lavender-100 bg-cream-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-display-md text-lavender-800">Memories from 2025</h2>
        <p className="mt-2 text-body-md text-ink-600">
          A glimpse of last year&apos;s gathering — for returning villagers.
        </p>

        <div className="mt-6 overflow-hidden rounded-lg border border-lavender-100 bg-ink-900 shadow-soft">
          <div className="relative aspect-video w-full">
            <iframe
              src={YOUTUBE_EMBED}
              title="Memories from 2025"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
