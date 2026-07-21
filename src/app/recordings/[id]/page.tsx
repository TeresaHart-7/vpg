import { notFound } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { RecordingDetail } from "@/components/recordings/RecordingDetail";
import { requireAuth, getCurrentProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import type { RecordingWithDetails } from "@/lib/types/database";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RecordingDetailPage({ params }: Props) {
  await requireAuth();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("recordings")
    .select(
      `
      *,
      profiles ( id, name, photo_url ),
      recording_comments (
        *,
        profiles ( id, name, photo_url )
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const recording = data as RecordingWithDetails;

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <EventSubnav />
        </div>
        <RecordingDetail
          recording={recording}
          myProfileId={profile.id}
          isAdmin={profile.is_admin}
        />
      </main>
    </div>
  );
}
