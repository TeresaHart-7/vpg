import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimProfileForm } from "@/components/claim/ClaimProfileForm";
import { SiteHeader } from "@/components/layout/SiteHeader";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ClaimPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: guest } = await supabase
    .from("linked_guests")
    .select("id, name, is_claimed, claim_token")
    .eq("claim_token", token)
    .single();

  if (!guest) notFound();

  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader showNav={false} />
      <main className="mx-auto max-w-md px-4 py-16">
        <ClaimProfileForm
          guestName={guest.name}
          claimToken={token}
          alreadyClaimed={guest.is_claimed}
        />
      </main>
    </div>
  );
}
