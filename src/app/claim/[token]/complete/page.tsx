import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ClaimCompletePage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/claim/${token}`);

  const { data: guest } = await supabase
    .from("linked_guests")
    .select("id, is_claimed")
    .eq("claim_token", token)
    .single();

  if (!guest) redirect("/dashboard");

  if (!guest.is_claimed) {
    await supabase
      .from("linked_guests")
      .update({
        is_claimed: true,
        claimed_by_user_id: user.id,
      })
      .eq("claim_token", token);
  }

  redirect("/dashboard?claimed=1");
}
