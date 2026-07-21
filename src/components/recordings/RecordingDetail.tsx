"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import type {
  RecordingWithDetails,
} from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/recordings/time";
import { getRecordingPublicUrl } from "@/lib/recordings/urls";
import { deleteRecordingAudio } from "@/lib/recordings/upload";
import { AudioPlayer } from "@/components/recordings/AudioPlayer";
import { ExternalPlayer } from "@/components/recordings/ExternalPlayer";
import { TranscriptView } from "@/components/recordings/TranscriptView";
import { CommentList } from "@/components/recordings/CommentList";
import { CommentComposer } from "@/components/recordings/CommentComposer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  recording: RecordingWithDetails;
  myProfileId: string;
  isAdmin: boolean;
};

export function RecordingDetail({ recording, myProfileId, isAdmin }: Props) {
  const router = useRouter();
  const isUpload = recording.source_type === "upload";
  const canManage = recording.profile_id === myProfileId || isAdmin;

  const [comments, setComments] = useState(recording.recording_comments || []);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekRequest, setSeekRequest] = useState<{
    seconds: number;
    token: number;
  } | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(recording.title);
  const [editDescription, setEditDescription] = useState(
    recording.description || ""
  );
  const [editTranscript, setEditTranscript] = useState(
    recording.transcript || ""
  );
  const [title, setTitle] = useState(recording.title);
  const [description, setDescription] = useState(recording.description);
  const [transcript, setTranscript] = useState(recording.transcript);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioSrc = useMemo(() => {
    if (!isUpload || !recording.storage_path || recording.storage_path === "pending") {
      return null;
    }
    return getRecordingPublicUrl(recording.storage_path);
  }, [isUpload, recording.storage_path]);

  const ticks = useMemo(
    () =>
      comments
        .filter((c) => !c.is_hidden && c.timestamp_seconds != null)
        .map((c) => ({ id: c.id, seconds: Number(c.timestamp_seconds) })),
    [comments]
  );

  const sortedComments = useMemo(() => {
    if (isUpload) {
      return [...comments].sort((a, b) => {
        const ta = a.timestamp_seconds;
        const tb = b.timestamp_seconds;
        if (ta != null && tb != null) return Number(ta) - Number(tb);
        if (ta != null) return -1;
        if (tb != null) return 1;
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    }
    return [...comments].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [comments, isUpload]);

  function seekTo(seconds: number) {
    setSeekRequest({ seconds, token: Date.now() });
    setCurrentTime(seconds);
  }

  function handleTickClick(id: string) {
    setHighlightId(id);
    const comment = comments.find((c) => c.id === id);
    if (comment?.timestamp_seconds != null) {
      seekTo(Number(comment.timestamp_seconds));
    }
  }

  async function saveEdit() {
    if (!editTitle.trim()) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("recordings")
      .update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        transcript: editTranscript.trim() || null,
      })
      .eq("id", recording.id);
    setBusy(false);
    if (updateError) {
      setError("Could not save changes.");
      return;
    }
    setTitle(editTitle.trim());
    setDescription(editDescription.trim() || null);
    setTranscript(editTranscript.trim() || null);
    setEditing(false);
  }

  async function deleteRecording() {
    if (!confirm("Delete this recording? This can’t be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      if (recording.storage_path && recording.storage_path !== "pending") {
        try {
          await deleteRecordingAudio(recording.storage_path);
        } catch {
          // Row delete still proceeds
        }
      }
      const { error: deleteError } = await supabase
        .from("recordings")
        .delete()
        .eq("id", recording.id);
      if (deleteError) throw deleteError;
      router.push("/recordings");
    } catch {
      setError("Could not delete recording.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/recordings"
          className="inline-flex items-center gap-1 text-body-sm font-semibold text-plum-600 hover:underline"
        >
          <ArrowLeft size={16} weight="bold" />
          All recordings
        </Link>

        {editing ? (
          <div className="mt-4 space-y-3">
            <Input
              label="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <Textarea
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              maxLength={2000}
            />
            <Textarea
              label="Transcript"
              value={editTranscript}
              onChange={(e) => setEditTranscript(e.target.value)}
              maxLength={100000}
              className="min-h-[140px]"
            />
            <div className="flex gap-2">
              <Button size="sm" loading={busy} onClick={saveEdit}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="mt-3 text-display-lg">{title}</h1>
            <p className="mt-2 text-body-md text-ink-600">
              {recording.profiles?.name || "Unknown"} ·{" "}
              {formatRelativeTime(recording.created_at)}
            </p>
            {description && (
              <p className="mt-3 whitespace-pre-wrap text-body-md text-ink-700">
                {description}
              </p>
            )}
            {(recording.tags?.length ?? 0) > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {recording.tags!.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-pill bg-lavender-50 px-2.5 py-0.5 text-body-sm text-plum-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {canManage && (
              <div className="mt-4 flex gap-3">
                <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={busy}
                  onClick={deleteRecording}
                  className="text-error"
                >
                  Delete
                </Button>
              </div>
            )}
          </>
        )}
        {error && <p className="mt-2 text-body-sm text-error">{error}</p>}
      </div>

      {isUpload ? (
        audioSrc ? (
          <AudioPlayer
            src={audioSrc}
            ticks={ticks}
            onTimeUpdate={setCurrentTime}
            onTickClick={handleTickClick}
            seekRequest={seekRequest}
          />
        ) : (
          <p className="rounded-md bg-peach-50 px-4 py-3 text-body-sm text-ink-700">
            Audio is still processing or unavailable.
          </p>
        )
      ) : recording.external_url ? (
        <ExternalPlayer url={recording.external_url} />
      ) : null}

      {transcript && (
        <TranscriptView
          transcript={transcript}
          currentTime={currentTime}
          syncEnabled={isUpload && !!audioSrc}
          onSeek={seekTo}
        />
      )}

      <section className="space-y-4">
        <h2 className="text-display-sm">
          Comments{" "}
          <span className="text-body-md font-normal text-ink-500">
            ({sortedComments.filter((c) => !c.is_hidden).length})
          </span>
        </h2>
        <CommentComposer
          recordingId={recording.id}
          myProfileId={myProfileId}
          isUpload={isUpload}
          currentTime={currentTime}
          onPosted={(comment) => {
            setComments((prev) => [...prev, comment]);
            if (comment.timestamp_seconds != null) {
              setHighlightId(comment.id);
            }
          }}
        />
        <CommentList
          comments={sortedComments}
          myProfileId={myProfileId}
          isAdmin={isAdmin}
          isUpload={isUpload}
          highlightId={highlightId}
          onSeek={(seconds) => {
            seekTo(seconds);
          }}
          onChanged={setComments}
        />
      </section>
    </div>
  );
}
