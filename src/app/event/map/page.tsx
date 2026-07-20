import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { CampMapView } from "@/components/event/CampMapView";
import { getContentBlock, requireAuth } from "@/lib/auth/helpers";
import { getPageContent } from "@/lib/content";
import { parseCampMap } from "@/lib/chat";

export default async function EventMapPage() {
  await requireAuth();
  const page = getPageContent("event-map");
  const raw = await getContentBlock("camp_map");
  const map = parseCampMap(raw) ?? { imageUrl: "/images/site-map.png" };

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">{page.title as string}</h1>
        <p className="mt-2 text-body-md text-ink-600">{page.subtitle as string}</p>
        <div className="mt-6">
          <EventSubnav />
        </div>
        <div className="mt-8">
          <CampMapView map={map} />
        </div>
      </main>
    </div>
  );
}
