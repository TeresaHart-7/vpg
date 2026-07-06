import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { ContentFilesGuide } from "@/components/admin/ContentFilesGuide";
import { requireAdmin } from "@/lib/auth/helpers";

export default async function AdminContentPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pb-8">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/admin" className="text-body-sm font-semibold text-plum-500 hover:underline">
          ← Admin
        </Link>
        <h1 className="mt-4 text-display-lg">Site copy</h1>
        <p className="mt-2 text-body-md text-ink-600">
          Page text and content blocks are edited as files — not in this admin UI.
        </p>
        <div className="mt-8">
          <ContentFilesGuide />
        </div>
      </main>
    </div>
  );
}
