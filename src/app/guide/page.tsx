import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";
import { getContentBlock, requireAuth } from "@/lib/auth/helpers";
import { markdownToHtml } from "@/lib/utils";

export default async function GuidePage() {
  await requireAuth();
  const content = await getContentBlock("participant_guide");

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Participant guide</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Logistics, location, and what to bring.
        </p>
        <Card tint="teal" className="mt-8">
          {content ? (
            <div
              className="prose-vpg"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          ) : (
            <p className="text-body-md text-ink-600">Guide content loading…</p>
          )}
        </Card>
      </main>
    </div>
  );
}
