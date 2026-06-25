import { AppNav } from "@/components/layout/AppNav";
import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { requireAuth, getCurrentProfile, getContentBlock } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  await requireAuth();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();

  const [{ data: linkedGuests }, { data: coCreation }, { data: operational }] =
    await Promise.all([
      supabase
        .from("linked_guests")
        .select("*")
        .eq("parent_profile_id", profile.id),
      supabase
        .from("co_creation_interests")
        .select("domain")
        .eq("profile_id", profile.id),
      supabase
        .from("operational_shifts")
        .select("shift_type")
        .eq("profile_id", profile.id),
    ]);

  const paymentInstructions = await getContentBlock("payment_instructions");

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Registration</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Take your time — your progress saves as you go.
        </p>
        <div className="mt-8">
          <RegistrationForm
            profile={profile}
            linkedGuests={linkedGuests || []}
            coCreationDomains={(coCreation || []).map((c) => c.domain)}
            operationalShifts={(operational || []).map((o) => o.shift_type)}
            paymentInstructions={paymentInstructions}
          />
        </div>
      </main>
    </div>
  );
}
