import { AppNav } from "@/components/layout/AppNav";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { requireAuth } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import type { AppNotification } from "@/lib/types/database";

export default async function NotificationsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Notifications</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Replies, announcements, and updates from the village.
        </p>
        <div className="mt-8">
          <NotificationsList notifications={(data as AppNotification[]) || []} />
        </div>
      </main>
    </div>
  );
}
