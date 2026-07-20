"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMessageTime } from "@/lib/chat";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { MessageWithSender } from "@/lib/types/database";

type Props = {
  message: MessageWithSender;
  userId: string;
  isOwn: boolean;
  align?: "start" | "end";
  onUpdated?: (message: MessageWithSender) => void;
};

export function EditableMessage({
  message,
  userId,
  isOwn,
  align = "start",
  onUpdated,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [local, setLocal] = useState(message);

  const canManage = local.sender_id === userId;

  async function saveEdit() {
    if (!draft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const { data, error: updateError } = await supabase
        .from("messages")
        .update({ body: draft.trim(), edited_at: now })
        .eq("id", local.id)
        .select("*")
        .single();
      if (updateError) throw updateError;
      const updated = { ...local, ...data, sender_name: local.sender_name };
      setLocal(updated);
      onUpdated?.(updated);
      setEditing(false);
    } catch {
      setError("Could not save edit.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteMessage() {
    if (!confirm("Delete this message?")) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const { data, error: updateError } = await supabase
        .from("messages")
        .update({ deleted_at: now, body: "" })
        .eq("id", local.id)
        .select("*")
        .single();
      if (updateError) throw updateError;
      const updated = { ...local, ...data, sender_name: local.sender_name };
      setLocal(updated);
      onUpdated?.(updated);
    } catch {
      setError("Could not delete message.");
    } finally {
      setBusy(false);
    }
  }

  if (local.deleted_at) {
    return (
      <div className={cn("flex", align === "end" ? "justify-end" : "justify-start")}>
        <p className="text-body-sm italic text-ink-500">
          Message deleted · {formatMessageTime(local.deleted_at)}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex", align === "end" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-md px-4 py-3",
          isOwn
            ? "rounded-br-sm bg-plum-100 text-ink-900"
            : "rounded-bl-sm bg-cream-100 text-ink-900"
        )}
      >
        {!isOwn && (
          <p className="mb-1 text-body-sm font-semibold text-plum-700">
            {local.sender_name}
          </p>
        )}

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2000}
              className="min-h-[72px] bg-white"
            />
            {error && <p className="text-body-sm text-error">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" loading={busy} onClick={saveEdit} disabled={!draft.trim()}>
                Save
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setDraft(local.body);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-body-md">{local.body}</p>
            <p className="mt-1 text-[11px] text-ink-600">
              {formatMessageTime(local.created_at)}
              {local.edited_at && ` · edited ${formatMessageTime(local.edited_at)}`}
            </p>
            {canManage && (
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-[11px] font-semibold text-plum-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={deleteMessage}
                  disabled={busy}
                  className="text-[11px] font-semibold text-error hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
