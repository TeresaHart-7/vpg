import Link from "next/link";
import {
  Sparkle,
  Heart,
  UsersThree,
  HandHeart,
  Compass,
} from "@phosphor-icons/react/dist/ssr";
import { SiteHeader, SiteFooter } from "@/components/layout/SiteHeader";
import { BlobOne, BlobTwo, BlobThree } from "@/components/decorative/Blobs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getContentBlock } from "@/lib/auth/helpers";
import { markdownToHtml } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

const principles = [
  {
    title: "Relationship first",
    body: "We show up for each other, not just the program.",
    icon: Heart,
    tint: "sage" as const,
  },
  {
    title: "Co-creation",
    body: "The gathering emerges from everyone's gifts and questions.",
    icon: Sparkle,
    tint: "peach" as const,
  },
  {
    title: "Care for the whole",
    body: "Children, elders, and newcomers are part of the village.",
    icon: UsersThree,
    tint: "teal" as const,
  },
  {
    title: "Honest presence",
    body: "We practice showing up as we are.",
    icon: HandHeart,
    tint: "lavender" as const,
  },
];

export default async function LandingPage() {
  const orientingContent = await getContentBlock("orienting_artifact");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const registerHref = user ? "/register" : "/login?redirect=/register";

  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader />

      <section className="relative overflow-hidden bg-lavender-50 px-4 py-16 sm:px-6 sm:py-24">
        <BlobOne className="-left-20 -top-20 h-80 w-80" />
        <BlobTwo className="-bottom-16 -right-16 h-72 w-72" color="teal" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-label text-teal-600">Sept 25–29, 2026 · Camp Ki-Wa-Y</p>
            <h1 className="mt-4 text-display-xl text-lavender-800">
              Welcome to the Village Playground
            </h1>
            <p className="mt-4 text-body-lg text-ink-600">
              This is for the Village Playground gathering — a 4–5 day exploration
              of villaging: cultivating interdependent, high-trust relationships
              of mutual support and thrival.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={registerHref}>
                <Button>Register now →</Button>
              </Link>
              <Link href="#about">
                <Button variant="secondary">About villaging</Button>
              </Link>
            </div>
          </div>
          <div className="relative mx-auto h-64 w-full max-w-md sm:h-80">
            <div className="absolute left-0 top-4 h-48 w-36 rotate-[-3deg] rounded-lg border-4 border-cream-50 bg-sage-100 shadow-soft sm:h-56 sm:w-44" />
            <div className="absolute left-16 top-12 h-48 w-36 rotate-[2deg] rounded-lg border-4 border-cream-50 bg-peach-100 shadow-raised sm:left-20 sm:h-56 sm:w-44" />
            <div className="absolute left-32 top-0 h-48 w-36 rotate-[4deg] rounded-lg border-4 border-cream-50 bg-teal-100 shadow-soft sm:left-36 sm:h-56 sm:w-44" />
          </div>
        </div>
      </section>

      <section id="about" className="relative px-4 py-16 sm:px-6 sm:py-20">
        <BlobThree className="right-0 top-0 h-64 w-64" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 flex items-center gap-3">
            <Compass className="text-plum-500" size={28} weight="duotone" />
            <h2 className="text-display-lg">About villaging</h2>
          </div>

          {orientingContent ? (
            <div
              className="prose-vpg max-w-3xl"
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(orientingContent),
              }}
            />
          ) : (
            <p className="max-w-3xl text-body-lg text-ink-600">
              The Village Playground is a gathering for people exploring
              villaging — cultivating interdependent, high-trust relationships
              of mutual support and thrival. ~70+ attendees including families
              and children, hosted by the Village Network Playground crew.
            </p>
          )}

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(({ title, body, icon: Icon, tint }) => (
              <Card key={title} tint={tint}>
                <Icon className="text-plum-500" size={28} weight="duotone" />
                <h3 className="mt-3 text-display-sm">{title}</h3>
                <p className="mt-2 text-body-sm text-ink-600">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teal-50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-display-md">Ready to join us?</h2>
          <p className="mt-3 text-body-md text-ink-600">
            Registration takes about 15 minutes. Only your name and email are
            required — everything else is optional and editable anytime.
          </p>
          <Link href={registerHref} className="mt-6 inline-block">
            <Button>Register now →</Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
