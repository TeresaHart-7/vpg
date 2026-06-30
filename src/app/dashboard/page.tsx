import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ComingBadge } from "@/components/ui/StatusBadge";
import { requireAuth, getCurrentProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  await requireAuth();
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { count: guestCount } = await supabase
    .from("linked_guests")
    .select("*", { count: "exact", head: true })
    .eq("parent_profile_id", profile!.id);

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">
          Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-body-md text-ink-600">
          Your home base for the Village Playground gathering.
        </p>

        <div className="mt-8 space-y-4">
          <Card tint="lavender">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-display-sm">Registration</h2>
                <p className="mt-1 text-body-sm text-ink-600">
                  {profile?.registration_complete
                    ? "Your registration is complete. You can still edit anytime."
                    : "Finish your profile so the host crew can plan."}
                </p>
                {profile?.is_coming && (
                  <div className="mt-3">
                    <ComingBadge isComing={profile.is_coming} />
                  </div>
                )}
              </div>
              <Link href="/register">
                <Button variant={profile?.registration_complete ? "secondary" : "primary"}>
                  {profile?.registration_complete ? "Edit profile" : "Continue registration"}
                </Button>
              </Link>
            </div>
          </Card>

          <Card tint="peach">
            <h2 className="text-display-sm">Payment</h2>
            <p className="mt-1 text-body-sm text-ink-600">
              $350 CAD for 4 days · e-transfer preferred
            </p>
            <Link href="/payment" className="mt-4 inline-block">
              <Button variant="secondary">View payment instructions</Button>
            </Link>
          </Card>

          <Card tint="teal">
            <h2 className="text-display-sm">Participant guide</h2>
            <p className="mt-1 text-body-sm text-ink-600">
              Location, packing list, food, and getting to camp.
            </p>
            <Link href="/guide" className="mt-4 inline-block">
              <Button variant="secondary">Open guide</Button>
            </Link>
          </Card>

          <Card tint="lavender">
            <h2 className="text-display-sm">At camp</h2>
            <p className="mt-1 text-body-sm text-ink-600">
              Schedule, map, agreements, announcements, and chat.
            </p>
            <Link href="/event" className="mt-4 inline-block">
              <Button variant="secondary">Open event hub</Button>
            </Link>
          </Card>

          <Card tint="lavender">
            <h2 className="text-display-sm">Directory &amp; network</h2>
            <p className="mt-1 text-body-sm text-ink-600">
              Browse who&apos;s coming and map your connections in the village.
            </p>
            <Link href="/directory" className="mt-4 inline-block">
              <Button variant="secondary">Open directory</Button>
            </Link>
          </Card>

          <Card tint="sage">
            <h2 className="text-display-sm">Logistics hub</h2>
            <p className="mt-1 text-body-sm text-ink-600">
              Coordinate rides, bedding, and supplies with other participants.
            </p>
            <Link href="/logistics" className="mt-4 inline-block">
              <Button variant="secondary">Open logistics hub</Button>
            </Link>
          </Card>

          {guestCount !== null && guestCount > 0 && (
            <Card tint="sage">
              <h2 className="text-display-sm">People you&apos;re bringing</h2>
              <p className="mt-1 text-body-sm text-ink-600">
                {guestCount} linked {guestCount === 1 ? "guest" : "guests"}
              </p>
            </Card>
          )}

          {profile?.is_admin && (
            <Card tint="teal">
              <h2 className="text-display-sm">Admin</h2>
              <p className="mt-1 text-body-sm text-ink-600">
                View and edit all participant registrations.
              </p>
              <Link href="/admin" className="mt-4 inline-block">
                <Button variant="secondary">Open admin table</Button>
              </Link>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
