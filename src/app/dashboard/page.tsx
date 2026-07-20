import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { PaymentStatusCard } from "@/components/dashboard/PaymentStatusCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ComingBadge } from "@/components/ui/StatusBadge";
import { requireAuth, getCurrentProfile } from "@/lib/auth/helpers";
import { getPageContent, getRegistrationCopy } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";

type DashboardCard = {
  id: string;
  title: string;
  description?: string;
  descriptionComplete?: string;
  descriptionIncomplete?: string;
  descriptionSingular?: string;
  descriptionPlural?: string;
  button?: string;
  buttonComplete?: string;
  buttonIncomplete?: string;
  href?: string;
  tint?: string;
  dynamic?: string;
  adminOnly?: boolean;
};

export default async function DashboardPage() {
  await requireAuth();
  const profile = await getCurrentProfile();
  const copy = getPageContent("dashboard");
  const registrationCopy = getRegistrationCopy();
  const cards = (copy.cards as DashboardCard[]) || [];
  const supabase = await createClient();

  const { count: guestCount } = await supabase
    .from("linked_guests")
    .select("*", { count: "exact", head: true })
    .eq("parent_profile_id", profile!.id);

  const titlePrefix = copy.title as string;
  const useName = copy.titleUsesName as boolean;

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">
          {titlePrefix}
          {useName && profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-body-md text-ink-600">{copy.subtitle as string}</p>

        <div className="mt-8 space-y-4">
          <PaymentStatusCard
            profile={profile!}
            sentCheckboxLabel={registrationCopy.payments.sentCheckbox}
            aug31CheckboxLabel={registrationCopy.payments.aug31Checkbox}
          />
          {cards.map((card) => {
            if (card.adminOnly && !profile?.is_admin) return null;
            if (card.dynamic === "guestCount" && (!guestCount || guestCount === 0)) return null;

            const tint = (card.tint || "white") as "lavender" | "peach" | "teal" | "sage" | "white";
            let description = card.description || "";
            if (card.id === "registration") {
              description = profile?.registration_complete
                ? card.descriptionComplete || description
                : card.descriptionIncomplete || description;
            }
            if (card.dynamic === "guestCount" && guestCount) {
              description =
                guestCount === 1
                  ? card.descriptionSingular || description
                  : (card.descriptionPlural || description).replace("{count}", String(guestCount));
            }

            const buttonLabel =
              card.id === "registration"
                ? profile?.registration_complete
                  ? card.buttonComplete
                  : card.buttonIncomplete
                : card.button;

            return (
              <Card key={card.id} tint={tint}>
                {card.href ? (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-display-sm">{card.title}</h2>
                      <p className="mt-1 text-body-sm text-ink-600">{description}</p>
                      {card.id === "registration" && profile?.is_coming && (
                        <div className="mt-3">
                          <ComingBadge isComing={profile.is_coming} />
                        </div>
                      )}
                    </div>
                    <Link href={card.href}>
                      <Button
                        variant={
                          card.id === "registration" && !profile?.registration_complete
                            ? "primary"
                            : "secondary"
                        }
                      >
                        {buttonLabel}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <h2 className="text-display-sm">{card.title}</h2>
                    <p className="mt-1 text-body-sm text-ink-600">{description}</p>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
