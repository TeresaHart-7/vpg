import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";

const KEYS = ["event_schedule", "camp_map", "camp_agreements"];

export default async function AdminContentPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("admin_content_blocks")
    .select("key, content")
    .in("key", KEYS);

  const blocks: Record<string, string> = {};
  for (const key of KEYS) blocks[key] = "";
  for (const row of data || []) {
    blocks[row.key] = row.content;
  }

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/admin" className="text-body-sm font-semibold text-plum-500 hover:underline">
          ← Admin
        </Link>
        <h1 className="mt-4 text-display-lg">Event content</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Edit schedule, camp map, and agreements shown during the gathering.
        </p>
        <div className="mt-8">
          <ContentEditor blocks={blocks} />
        </div>
        <div className="mt-8">
          <Link href="/event">
            <Button variant="secondary">Preview at camp pages</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
