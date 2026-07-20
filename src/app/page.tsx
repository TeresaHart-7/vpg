import Image from "next/image";
import Link from "next/link";
import { Compass } from "@phosphor-icons/react/dist/ssr";
import { AppNav } from "@/components/layout/AppNav";
import { SiteHeader, SiteFooter } from "@/components/layout/SiteHeader";
import { MemoriesFrom2025 } from "@/components/landing/MemoriesFrom2025";
import { BlobOne, BlobTwo, BlobThree } from "@/components/decorative/Blobs";
import { Button } from "@/components/ui/Button";
import { getContentBlock } from "@/lib/auth/helpers";
import { getPageContent } from "@/lib/content";
import { markdownToHtml, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const page = getPageContent("landing");
  const hero = page.hero as Record<string, string>;
  const about = page.about as Record<string, string>;
  const cta = page.cta as Record<string, string>;
  const orientingContent = await getContentBlock("orienting_artifact");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const registerHref = user ? "/register" : "/login?redirect=/register";

  return (
    <div className={cn("min-h-screen bg-cream-50", user && "pb-24 md:pb-8")}>
      {user ? <AppNav /> : <SiteHeader />}

      <section className="relative overflow-hidden bg-lavender-50 px-4 py-16 sm:px-6 sm:py-24">
        <BlobOne className="-left-20 -top-20 h-80 w-80" />
        <BlobTwo className="-bottom-16 -right-16 h-72 w-72" color="teal" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-label text-teal-600">{hero.eyebrow}</p>
            <h1 className="mt-4 text-display-xl text-lavender-800">{hero.title}</h1>
            <p className="mt-4 text-body-lg text-ink-600">{hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={registerHref}>
                <Button>{hero.primaryCta}</Button>
              </Link>
              <Link href="#about">
                <Button variant="secondary">{hero.secondaryCta}</Button>
              </Link>
            </div>
          </div>
          <div className="relative mx-auto h-64 w-full max-w-md sm:h-80">
            <div className="absolute left-0 top-4 h-48 w-36 rotate-[-3deg] overflow-hidden rounded-lg border-4 border-cream-50 shadow-soft sm:h-56 sm:w-44">
              <Image
                src="/images/home/hero-huddle.png"
                alt="Participants in a circle huddle at Camp Ki-Wa-Y"
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>
            <div className="absolute left-16 top-12 h-48 w-36 rotate-[2deg] overflow-hidden rounded-lg border-4 border-cream-50 shadow-raised sm:left-20 sm:h-56 sm:w-44">
              <Image
                src="/images/home/hero-mingling.png"
                alt="Community gathering on the outdoor deck"
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>
            <div className="absolute left-32 top-0 h-48 w-36 rotate-[4deg] overflow-hidden rounded-lg border-4 border-cream-50 shadow-soft sm:left-36 sm:h-56 sm:w-44">
              <Image
                src="/images/home/hero-tree.png"
                alt="Outdoor seating under a large tree in autumn"
                fill
                className="object-cover"
                sizes="176px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative px-4 py-16 sm:px-6 sm:py-20">
        <BlobThree className="right-0 top-0 h-64 w-64" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 flex items-center gap-3">
            <Compass className="text-plum-500" size={28} weight="duotone" />
            <h2 className="text-display-lg">{about.title}</h2>
          </div>

          {orientingContent ? (
            <div
              className="prose-vpg max-w-3xl"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(orientingContent) }}
            />
          ) : (
            <p className="max-w-3xl text-body-lg text-ink-600">{about.fallback}</p>
          )}
        </div>
      </section>

      <section className="bg-teal-50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-display-md">{cta.title}</h2>
          <p className="mt-3 text-body-md text-ink-600">{cta.subtitle}</p>
          <Link href={registerHref} className="mt-6 inline-block">
            <Button>{cta.button}</Button>
          </Link>
        </div>
      </section>

      {user && <MemoriesFrom2025 />}

      <SiteFooter />
    </div>
  );
}
