import { Suspense } from "react";
import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { EventSubnav } from "@/components/event/EventSubnav";
import { NewThreadForm } from "@/components/event/NewThreadForm";
import { requireAuth, getCurrentProfile } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ type?: string }>;
};

export default async function NewChatPage({ searchParams }: Props) {
  const user = await requireAuth();
  const profile = await getCurrentProfile();
  const { type } = await searchParams;
  const supabase = await createClient();

  const { data: participants } = await supabase
    .from("profiles")
    .select("id, user_id, name")
    .neq("name", "")
    .order("name");

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/event/chat"
          className="text-body-sm font-semibold text-plum-500 hover:underline"
        >
          ← Back to chat
        </Link>
        <h1 className="mt-4 text-display-lg">Start a conversation</h1>
        <div className="mt-6">
          <EventSubnav />
        </div>
        <div className="mt-8">
          <Suspense fallback={<p className="text-body-md text-ink-600">Loading…</p>}>
            <NewThreadForm
              userId={user.id}
              myProfileId={profile!.id}
              participants={participants || []}
              initialType={type === "dm" ? "dm" : "topic"}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
