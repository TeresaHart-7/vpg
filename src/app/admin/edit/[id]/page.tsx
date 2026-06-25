import { notFound } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { requireAdmin, getContentBlock } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const [{ data: linkedGuests }, { data: coCreation }, { data: operational }] =
    await Promise.all([
      supabase.from("linked_guests").select("*").eq("parent_profile_id", id),
      supabase
        .from("co_creation_interests")
        .select("domain")
        .eq("profile_id", id),
      supabase
        .from("operational_shifts")
        .select("shift_type")
        .eq("profile_id", id),
    ]);

  const paymentInstructions = await getContentBlock("payment_instructions");

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Edit: {profile.name || "Participant"}</h1>
        <p className="mt-2 text-body-md text-ink-600">Admin edit mode</p>
        <div className="mt-8">
          <RegistrationForm
            profile={profile as Profile}
            linkedGuests={linkedGuests || []}
            coCreationDomains={(coCreation || []).map((c) => c.domain)}
            operationalShifts={(operational || []).map((o) => o.shift_type)}
            paymentInstructions={paymentInstructions}
            isAdminEdit
            editProfileId={id}
            initialStep="profile"
          />
        </div>
      </main>
    </div>
  );
}
