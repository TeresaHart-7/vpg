import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";
import { requireAuth } from "@/lib/auth/helpers";
import { getPageContent, getPackingChecklist } from "@/lib/content";
import { PrintChecklistButton } from "@/components/logistics/PrintChecklistButton";

export default async function ChecklistPage() {
  await requireAuth();
  const page = getPageContent("checklist");
  const sections = getPackingChecklist();

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8 print:bg-white print:pb-0">
      <AppNav />
      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6 print:py-6">
        <div className="mb-6 print:hidden">
          <PrintChecklistButton label={page.printButton as string} />
        </div>
        <Card tint="white" className="print:shadow-none">
          <h1 className="text-display-lg">{page.title as string}</h1>
          <p className="mt-2 text-body-md text-ink-600">{page.subtitle as string}</p>
          <div className="mt-6 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                {section.title ? (
                  <h2 className="text-body-lg font-semibold text-ink-900">{section.title}</h2>
                ) : null}
                <ul className={section.title ? "mt-3 space-y-3" : "space-y-3"}>
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-body-md">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 border-ink-300 print:border-ink-900" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
