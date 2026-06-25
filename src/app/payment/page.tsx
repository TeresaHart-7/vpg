import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";
import { getContentBlock } from "@/lib/auth/helpers";
import { markdownToHtml } from "@/lib/utils";
import { requireAuth } from "@/lib/auth/helpers";

export default async function PaymentPage() {
  await requireAuth();
  const content = await getContentBlock("payment_instructions");

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Payment instructions</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Payments are manual (e-transfer, Wise, PayPal, Venmo) — the app tracks
          status only.
        </p>
        <Card tint="peach" className="mt-8">
          {content ? (
            <div
              className="prose-vpg"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          ) : (
            <p className="text-body-md text-ink-600">
              Payment details will appear here once configured in Supabase.
            </p>
          )}
        </Card>
      </main>
    </div>
  );
}
