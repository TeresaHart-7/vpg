"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CampSessionWithDetails } from "@/lib/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

type Props = {
  sessions: CampSessionWithDetails[];
  myProfileId: string;
  highlightSessionId?: string;
  placeholder: string;
  emptyMessage: string;
};

const SESSION_SELECT = `
  *,
  profiles ( id, name, photo_url ),
  camp_session_votes ( id, session_id, profile_id, created_at ),
  camp_session_replies (
    *,
    profiles ( id, name, photo_url )
  )
`;

export function SessionsHub({
  sessions: initial,
  myProfileId,
  highlightSessionId,
  placeholder,
  emptyMessage,
}: Props) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const votesA = a.camp_session_votes?.length ?? 0;
      const votesB = b.camp_session_votes?.length ?? 0;
      if (votesB !== votesA) return votesB - votesA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [sessions]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("camp_sessions")
      .insert({
        profile_id: myProfileId,
        title: title.trim(),
        body: body.trim(),
      })
      .select(SESSION_SELECT)
      .single();

    setSubmitting(false);
    if (!error && data) {
      setSessions((prev) => [data as CampSessionWithDetails, ...prev]);
      setTitle("");
      setBody("");
      setShowForm(false);
      router.refresh();
    }
  }, [body, myProfileId, router, title]);

  const handleReply = useCallback(
    async (sessionId: string) => {
      const text = replyDrafts[sessionId]?.trim();
      if (!text) return;
      setReplyingId(sessionId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("camp_session_replies")
        .insert({
          session_id: sessionId,
          profile_id: myProfileId,
          body: text,
        })
        .select(`*, profiles ( id, name, photo_url )`)
        .single();

      setReplyingId(null);
      if (!error && data) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  camp_session_replies: [...(s.camp_session_replies || []), data],
                }
              : s
          )
        );
        setReplyDrafts((d) => ({ ...d, [sessionId]: "" }));
      }
    },
    [myProfileId, replyDrafts]
  );

  const handleVote = useCallback(
    async (sessionId: string) => {
      setVotingId(sessionId);
      const supabase = createClient();
      const session = sessions.find((s) => s.id === sessionId);
      const existing = session?.camp_session_votes?.find(
        (v) => v.profile_id === myProfileId
      );

      if (existing) {
        const { error } = await supabase
          .from("camp_session_votes")
          .delete()
          .eq("id", existing.id);

        setVotingId(null);
        if (!error) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    camp_session_votes: s.camp_session_votes.filter(
                      (v) => v.id !== existing.id
                    ),
                  }
                : s
            )
          );
        }
      } else {
        const { data, error } = await supabase
          .from("camp_session_votes")
          .insert({ session_id: sessionId, profile_id: myProfileId })
          .select("id, session_id, profile_id, created_at")
          .single();

        setVotingId(null);
        if (!error && data) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    camp_session_votes: [...(s.camp_session_votes || []), data],
                  }
                : s
            )
          );
        }
      }
    },
    [myProfileId, sessions]
  );

  const startEdit = useCallback((session: CampSessionWithDetails) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    setEditBody(session.body);
  }, []);

  const handleSaveEdit = useCallback(
    async (sessionId: string) => {
      if (!editTitle.trim()) return;
      setSavingId(sessionId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("camp_sessions")
        .update({ title: editTitle.trim(), body: editBody.trim() })
        .eq("id", sessionId)
        .select(SESSION_SELECT)
        .single();

      setSavingId(null);
      if (!error && data) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? (data as CampSessionWithDetails) : s))
        );
        setEditingId(null);
        router.refresh();
      }
    },
    [editBody, editTitle, router]
  );

  const handleDelete = useCallback(
    async (sessionId: string) => {
      if (!confirm("Delete this session proposal?")) return;
      setDeletingId(sessionId);
      const supabase = createClient();
      const { error } = await supabase.from("camp_sessions").delete().eq("id", sessionId);

      setDeletingId(null);
      if (!error) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        router.refresh();
      }
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <Card tint="sage">
        <h2 className="text-display-sm">Propose a session</h2>
        <p className="mt-1 text-body-md text-ink-600">
          Share an activity you&apos;d like to lead or join — others can vote and comment.
        </p>
        {!showForm ? (
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            Add a session
          </Button>
        ) : (
          <div className="mt-4 space-y-4">
            <Input
              label="Title"
              placeholder={placeholder}
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
        {sorted.length === 0 && (
          <p className="text-body-md text-ink-600">{emptyMessage}</p>
        )}
        {sorted.map((session) => {
          const voteCount = session.camp_session_votes?.length ?? 0;
          const hasVoted = session.camp_session_votes?.some(
            (v) => v.profile_id === myProfileId
          );
          const isOwner = session.profile_id === myProfileId;
          const isEditing = editingId === session.id;

          return (
            <li key={session.id}>
              <Card
                tint="white"
                className={cn(
                  highlightSessionId === session.id && "ring-2 ring-plum-500"
                )}
              >
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleVote(session.id)}
                    disabled={votingId === session.id}
                    className={cn(
                      "flex shrink-0 flex-col items-center gap-0.5 rounded-sm px-2 py-1 transition-colors",
                      hasVoted
                        ? "bg-plum-100 text-plum-700"
                        : "bg-lavender-50 text-ink-600 hover:bg-lavender-100"
                    )}
                    aria-label={hasVoted ? "Remove vote" : "Vote for this session"}
                  >
                    <span className="text-lg leading-none">▲</span>
                    <span className="text-body-sm font-semibold tabular-nums">
                      {voteCount}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          label="Title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                        <Textarea
                          label="Details"
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          maxLength={500}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(session.id)}
                            loading={savingId === session.id}
                            disabled={!editTitle.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-display-sm">{session.title}</h3>
                            <p className="mt-0.5 text-body-sm text-ink-600">
                              {session.profiles?.name || "Someone"}
                              {" · "}
                              {new Date(session.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {isOwner && (
                            <div className="flex items-center gap-2">
                              <span className="rounded-pill bg-lavender-100 px-2 py-0.5 text-[11px] font-semibold text-lavender-800">
                                Yours
                              </span>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => startEdit(session)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                loading={deletingId === session.id}
                                onClick={() => handleDelete(session.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                        {session.body && (
                          <p className="mt-3 whitespace-pre-wrap text-body-md text-ink-900">
                            {session.body}
                          </p>
                        )}
                      </>
                    )}

                    {!isEditing && (session.camp_session_replies?.length ?? 0) > 0 && (
                      <ul className="mt-4 space-y-3 border-t border-lavender-100 pt-4">
                        {session.camp_session_replies.map((reply) => (
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

                    {!isEditing && (
                      <div className="mt-4 flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment…"
                          value={replyDrafts[session.id] || ""}
                          onChange={(e) =>
                            setReplyDrafts((d) => ({ ...d, [session.id]: e.target.value }))
                          }
                          className="min-w-0 flex-1 rounded-sm border border-ink-300 bg-white px-3 py-2 text-body-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleReply(session.id);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={replyingId === session.id}
                          disabled={!replyDrafts[session.id]?.trim()}
                          onClick={() => handleReply(session.id)}
                        >
                          Comment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
