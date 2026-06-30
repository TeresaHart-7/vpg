import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { AgreementsView } from "@/components/event/AgreementsView";
import { Card } from "@/components/ui/Card";
import { getContentBlock, requireAuth } from "@/lib/auth/helpers";

export default async function EventAgreementsPage() {
  await requireAuth();
  const content =
    (await getContentBlock("camp_agreements")) ??
    "Camp agreements will be posted here.";

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Camp agreements</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Shared norms so we can care for each other and the land.
        </p>
        <div className="mt-6">
          <EventSubnav />
        </div>
        <Card tint="cream" className="mt-8">
          <AgreementsView content={content} />
        </Card>
      </main>
    </div>
  );
}
