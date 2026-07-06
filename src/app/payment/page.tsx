import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";
import { getContentBlock, requireAuth } from "@/lib/auth/helpers";
import { getPageContent } from "@/lib/content";
import { markdownToHtml } from "@/lib/utils";

export default async function PaymentPage() {
  await requireAuth();
  const content = await getContentBlock("payment_instructions");
  const page = getPageContent("payment");

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">{page.title as string}</h1>
        <p className="mt-2 text-body-md text-ink-600">{page.subtitle as string}</p>
        <Card tint="peach" className="mt-8">
          {content ? (
            <div
              className="prose-vpg"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          ) : (
            <p className="text-body-md text-ink-600">{page.emptyMessage as string}</p>
          )}
        </Card>
      </main>
    </div>
  );
}
