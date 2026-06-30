import { AppNav } from "@/components/layout/AppNav";
import { AdminTable } from "@/components/admin/AdminTable";
import { CoCreationSummary } from "@/components/admin/CoCreationSummary";
import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      `
      *,
      linked_guests ( name )
    `
    )
    .order("name");

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-display-lg">Admin</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Participant registrations — click edit to update any profile.
        </p>
        <div className="mt-8">
          <AdminTable profiles={profiles || []} />
        </div>
        <div className="mt-6">
          <a
            href="/admin/content"
            className="text-body-sm font-semibold text-plum-500 hover:underline"
          >
            Edit event content (schedule, map, agreements) →
          </a>
        </div>
        <CoCreationSummary />
      </main>
    </div>
  );
}
