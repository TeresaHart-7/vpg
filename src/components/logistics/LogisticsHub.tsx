"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LOGISTICS_CATEGORIES, type LogisticsCategoryId } from "@/lib/constants";
import type {
  LogisticsSubmissionWithAuthor,
  LogisticsReplyWithAuthor,
} from "@/lib/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

type SubmissionRow = LogisticsSubmissionWithAuthor & {
  logistics_replies: LogisticsReplyWithAuthor[];
};

type Props = {
  submissions: SubmissionRow[];
  myProfileId: string;
  highlightSubmissionId?: string;
};

export function LogisticsHub({
  submissions: initial,
  myProfileId,
  highlightSubmissionId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<LogisticsCategoryId>(
    (searchParams.get("tab") as LogisticsCategoryId) || "travel"
  );
  const [submissions, setSubmissions] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const category = LOGISTICS_CATEGORIES.find((c) => c.id === tab)!;

  const filtered = useMemo(
    () => submissions.filter((s) => s.category === tab),
    [submissions, tab]
  );

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("logistics_submissions")
      .insert({
        profile_id: myProfileId,
        category: tab,
        title: title.trim(),
        body: body.trim(),
      })
      .select(
        `
        *,
        profiles ( id, name, photo_url ),
        logistics_replies (
          *,
          profiles ( id, name, photo_url )
        )
      `
      )
      .single();

    setSubmitting(false);
    if (!error && data) {
      setSubmissions((prev) => [data as SubmissionRow, ...prev]);
      setTitle("");
      setBody("");
      setShowForm(false);
      router.refresh();
    }
  }, [body, myProfileId, router, tab, title]);

  const handleReply = useCallback(
    async (submissionId: string) => {
      const text = replyDrafts[submissionId]?.trim();
      if (!text) return;
      setReplyingId(submissionId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("logistics_replies")
        .insert({
          submission_id: submissionId,
          profile_id: myProfileId,
          body: text,
        })
        .select(`*, profiles ( id, name, photo_url )`)
        .single();

      setReplyingId(null);
      if (!error && data) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submissionId
              ? {
                  ...s,
                  logistics_replies: [
                    ...(s.logistics_replies || []),
                    data as LogisticsReplyWithAuthor,
                  ],
                }
              : s
          )
        );
        setReplyDrafts((d) => ({ ...d, [submissionId]: "" }));
      }
    },
    [myProfileId, replyDrafts]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {LOGISTICS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setTab(cat.id)}
            className={cn(
              "rounded-pill px-4 py-2 text-body-sm font-semibold transition-colors",
              tab === cat.id
                ? "bg-plum-500 text-white shadow-soft"
                : "bg-lavender-50 text-ink-600 hover:bg-lavender-100"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <Card tint={category.tint}>
        <h2 className="text-display-sm">{category.label}</h2>
        <p className="mt-1 text-body-md text-ink-600">{category.description}</p>
        {!showForm ? (
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            Add a post
          </Button>
        ) : (
          <div className="mt-4 space-y-4">
            <Input
              label="Title"
              placeholder={category.placeholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label="Details (optional)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmit} loading={submitting} disabled={!title.trim()}>
                Post
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ul className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-body-md text-ink-600">
            No posts yet in {category.label.toLowerCase()} — be the first!
          </p>
        )}
        {filtered.map((sub) => (
          <li key={sub.id}>
            <Card
              tint="white"
              className={cn(
                highlightSubmissionId === sub.id && "ring-2 ring-plum-500"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-display-sm">{sub.title}</h3>
                  <p className="mt-0.5 text-body-sm text-ink-600">
                    {sub.profiles?.name || "Someone"}
                    {" · "}
                    {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>
                {sub.profile_id === myProfileId && (
                  <span className="rounded-pill bg-lavender-100 px-2 py-0.5 text-[11px] font-semibold text-lavender-800">
                    Yours
                  </span>
                )}
              </div>
              {sub.body && (
                <p className="mt-3 whitespace-pre-wrap text-body-md text-ink-900">
                  {sub.body}
                </p>
              )}

              {(sub.logistics_replies?.length ?? 0) > 0 && (
                <ul className="mt-4 space-y-3 border-t border-lavender-100 pt-4">
                  {sub.logistics_replies.map((reply) => (
                    <li
                      key={reply.id}
                      className="rounded-sm bg-cream-50 px-3 py-2"
                    >
                      <p className="text-body-sm font-semibold text-ink-900">
                        {reply.profiles?.name || "Someone"}
                      </p>
                      <p className="mt-0.5 text-body-sm text-ink-600">{reply.body}</p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Write a reply…"
                  value={replyDrafts[sub.id] || ""}
                  onChange={(e) =>
                    setReplyDrafts((d) => ({ ...d, [sub.id]: e.target.value }))
                  }
                  className="min-w-0 flex-1 rounded-sm border border-ink-300 bg-white px-3 py-2 text-body-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(sub.id);
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  loading={replyingId === sub.id}
                  disabled={!replyDrafts[sub.id]?.trim()}
                  onClick={() => handleReply(sub.id)}
                >
                  Reply
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
