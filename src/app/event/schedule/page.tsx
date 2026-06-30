import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { ScheduleView } from "@/components/event/ScheduleView";
import { Card } from "@/components/ui/Card";
import { getContentBlock, requireAuth } from "@/lib/auth/helpers";
import { parseEventSchedule } from "@/lib/schedule";

export default async function EventSchedulePage() {
  await requireAuth();
  const raw = await getContentBlock("event_schedule");
  const schedule = parseEventSchedule(raw);

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Schedule</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Fri Sep 26 – Tue Sep 30. Times are approximate — follow the aliveness.
        </p>
        <div className="mt-6">
          <EventSubnav />
        </div>
        <Card tint="white" className="mt-8">
          {schedule ? (
            <ScheduleView schedule={schedule} />
          ) : (
            <p className="text-body-md text-ink-600">
              Schedule not published yet. Check back soon.
            </p>
          )}
        </Card>
      </main>
    </div>
  );
}
