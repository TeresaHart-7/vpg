"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Thread } from "@/lib/types/database";

type Props = {
  thread: Thread;
  userId: string;
  backHref?: string;
};

export function ThreadHeader({ thread, userId, backHref = "/messages" }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(thread.title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthor = thread.created_by === userId && thread.type === "topic_chat";

  async function saveTitle() {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("threads")
        .update({ title: title.trim() })
        .eq("id", thread.id);
      if (updateError) throw updateError;
      setEditing(false);
      router.refresh();
    } catch {
      setError("Could not update title.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteThread() {
    if (!confirm("Delete this thread and all its messages?")) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("threads")
        .delete()
        .eq("id", thread.id);
      if (deleteError) throw deleteError;
      router.push(backHref);
      router.refresh();
    } catch {
      setError("Could not delete thread.");
      setBusy(false);
    }
  }

  return (
    <div>
      {editing ? (
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          {error && <p className="text-body-sm text-error">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" loading={busy} onClick={saveTitle}>
              Save title
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-display-md">{title}</h1>
          {isAuthor && (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                Edit title
              </Button>
              <Button size="sm" variant="secondary" onClick={deleteThread} loading={busy}>
                Delete thread
              </Button>
            </div>
          )}
        </div>
      )}
      {error && !editing && <p className="mt-2 text-body-sm text-error">{error}</p>}
    </div>
  );
}
