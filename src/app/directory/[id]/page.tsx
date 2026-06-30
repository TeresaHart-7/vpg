import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { AppNav } from "@/components/layout/AppNav";
import { ProfileBioView } from "@/components/directory/ProfileBioView";
import { requireAuth, getCurrentProfile, toPublicProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DirectoryProfilePage({ params }: Props) {
  const { id } = await params;
  const user = await requireAuth();
  const myProfile = await getCurrentProfile();
  if (!myProfile) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile?.name) notFound();

  const { data: connection } = await supabase
    .from("connections")
    .select("strength")
    .eq("profile_id_a", myProfile.id)
    .eq("profile_id_b", id)
    .eq("set_by_user_id", user.id)
    .maybeSingle();

  const publicProfile = toPublicProfile(profile);
  const isOwnProfile = profile.id === myProfile.id;

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/directory"
          className="mb-6 inline-flex items-center gap-1 text-body-sm font-semibold text-plum-500 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to directory
        </Link>
        <ProfileBioView
          profile={publicProfile}
          myProfileId={myProfile.id}
          userId={user.id}
          initialStrength={connection?.strength ?? 0}
          isOwnProfile={isOwnProfile}
        />
      </main>
    </div>
  );
}
