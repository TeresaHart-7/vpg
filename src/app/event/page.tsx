import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { Card } from "@/components/ui/Card";
import { requireAuth } from "@/lib/auth/helpers";
import { getPageContent } from "@/lib/content";
import {
  CalendarBlank,
  MapTrifold,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";

const ICONS = {
  Schedule: CalendarBlank,
  Sessions: Sparkle,
  Map: MapTrifold,
} as const;

export default async function EventHubPage() {
  await requireAuth();
  const page = getPageContent("event");
  const sections = page.sections as { label: string; description: string; href: string }[];

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">{page.title as string}</h1>
        <p className="mt-2 text-body-md text-ink-600">{page.subtitle as string}</p>
        <div className="mt-6">
          <EventSubnav />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {sections.map((section) => {
            const Icon = ICONS[section.label as keyof typeof ICONS];
            return (
              <Link key={section.href} href={section.href}>
                <Card tint="white" className="h-full transition-transform hover:-translate-y-0.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lavender-50 text-plum-600">
                    <Icon size={22} weight="duotone" />
                  </span>
                  <h2 className="mt-3 text-display-sm">{section.label}</h2>
                  <p className="mt-1 text-body-sm text-ink-600">{section.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
