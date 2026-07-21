"use client";

import { useEffect, useRef, useState } from "react";
import type { RecordingCommentWithAuthor } from "@/lib/types/database";
import { formatRelativeTime, formatTimestamp } from "@/lib/recordings/time";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

type Props = {
  comments: RecordingCommentWithAuthor[];
  myProfileId: string;
  isAdmin: boolean;
  isUpload: boolean;
  highlightId?: string | null;
  onSeek?: (seconds: number) => void;
  onChanged: (comments: RecordingCommentWithAuthor[]) => void;
};

export function CommentList({
  comments,
  myProfileId,
  isAdmin,
  isUpload,
  highlightId,
  onSeek,
  onChanged,
}: Props) {
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightId) return;
    itemRefs.current[highlightId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlightId]);

  const visible = comments.filter(
    (c) => !c.is_hidden || c.profile_id === myProfileId || isAdmin
  );

  async function saveEdit(id: string) {
    if (!draft.trim()) return;
    setBusyId(id);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("recording_comments")
      .update({ body: draft.trim() })
      .eq("id", id)
      .select("*, profiles ( id, name, photo_url )")
      .single();
    setBusyId(null);
    if (!error && data) {
      onChanged(
        comments.map((c) =>
          c.id === id ? (data as RecordingCommentWithAuthor) : c
        )
      );
      setEditingId(null);
    }
  }

  async function hideComment(id: string) {
    if (!confirm("Hide this comment?")) return;
    setBusyId(id);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("recording_comments")
      .update({ is_hidden: true })
      .eq("id", id)
      .select("*, profiles ( id, name, photo_url )")
      .single();
    setBusyId(null);
    if (!error && data) {
      onChanged(
        comments.map((c) =>
          c.id === id ? (data as RecordingCommentWithAuthor) : c
        )
      );
    }
  }

  async function unhideComment(id: string) {
    setBusyId(id);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("recording_comments")
      .update({ is_hidden: false })
      .eq("id", id)
      .select("*, profiles ( id, name, photo_url )")
      .single();
    setBusyId(null);
    if (!error && data) {
      onChanged(
        comments.map((c) =>
          c.id === id ? (data as RecordingCommentWithAuthor) : c
        )
      );
    }
  }

  async function deleteComment(id: string) {
    if (!confirm("Delete this comment permanently?")) return;
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("recording_comments")
      .delete()
      .eq("id", id);
    setBusyId(null);
    if (!error) {
      onChanged(comments.filter((c) => c.id !== id));
    }
  }

  if (visible.length === 0) {
    return (
      <p className="text-body-sm text-ink-600">
        No comments yet — leave the first note below.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {visible.map((comment) => {
        const canManage =
          comment.profile_id === myProfileId || isAdmin;
        const isHighlighted = highlightId === comment.id;

        return (
          <li
            key={comment.id}
            ref={(el) => {
              itemRefs.current[comment.id] = el;
            }}
            className={cn(
              "rounded-md bg-cream-100 px-4 py-3 transition-shadow",
              isHighlighted && "ring-2 ring-plum-300",
              comment.is_hidden && "opacity-60"
            )}
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-body-sm font-semibold text-ink-900">
                {comment.profiles?.name || "Unknown"}
              </span>
              <span className="text-body-sm text-ink-500">
                {formatRelativeTime(comment.created_at)}
              </span>
              {comment.is_hidden && (
                <span className="text-body-sm text-peach-600">Hidden</span>
              )}
              {isUpload && comment.timestamp_seconds != null && (
                <button
                  type="button"
                  onClick={() => onSeek?.(Number(comment.timestamp_seconds))}
                  className="rounded-pill bg-lavender-50 px-2 py-0.5 text-body-sm font-semibold text-plum-600 hover:bg-lavender-100"
                >
                  {formatTimestamp(Number(comment.timestamp_seconds))}
                </button>
              )}
              {!isUpload && comment.timestamp_label && (
                <span className="rounded-pill bg-white px-2 py-0.5 text-body-sm text-ink-600">
                  {comment.timestamp_label}
                </span>
              )}
            </div>

            {editingId === comment.id ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={2000}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    loading={busyId === comment.id}
                    onClick={() => saveEdit(comment.id)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-body-md text-ink-800">
                {comment.body}
              </p>
            )}

            {canManage && editingId !== comment.id && (
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="text-body-sm font-semibold text-plum-600 hover:underline"
                  onClick={() => {
                    setEditingId(comment.id);
                    setDraft(comment.body);
                  }}
                >
                  Edit
                </button>
                {comment.is_hidden ? (
                  <button
                    type="button"
                    className="text-body-sm font-semibold text-plum-600 hover:underline"
                    disabled={busyId === comment.id}
                    onClick={() => unhideComment(comment.id)}
                  >
                    Unhide
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-body-sm font-semibold text-plum-600 hover:underline"
                    disabled={busyId === comment.id}
                    onClick={() => hideComment(comment.id)}
                  >
                    Hide
                  </button>
                )}
                <button
                  type="button"
                  className="text-body-sm font-semibold text-error hover:underline"
                  disabled={busyId === comment.id}
                  onClick={() => deleteComment(comment.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
