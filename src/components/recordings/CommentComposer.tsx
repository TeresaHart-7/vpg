"use client";

import { useState } from "react";
import type { RecordingCommentWithAuthor } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import { formatTimestamp } from "@/lib/recordings/time";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  recordingId: string;
  myProfileId: string;
  isUpload: boolean;
  currentTime?: number;
  onPosted: (comment: RecordingCommentWithAuthor) => void;
};

export function CommentComposer({
  recordingId,
  myProfileId,
  isUpload,
  currentTime = 0,
  onPosted,
}: Props) {
  const [body, setBody] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [pinCurrent, setPinCurrent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      recording_id: recordingId,
      profile_id: myProfileId,
      body: body.trim(),
    };

    if (isUpload && pinCurrent) {
      payload.timestamp_seconds = Math.floor(currentTime);
    } else if (!isUpload && timeLabel.trim()) {
      payload.timestamp_label = timeLabel.trim();
    }

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("recording_comments")
      .insert(payload)
      .select("*, profiles ( id, name, photo_url )")
      .single();

    setSubmitting(false);
    if (insertError || !data) {
      setError("Could not post comment. Try again?");
      return;
    }

    onPosted(data as RecordingCommentWithAuthor);
    setBody("");
    setTimeLabel("");
  }

  return (
    <div className="space-y-3 rounded-lg border border-lavender-200 bg-white p-4">
      <h3 className="text-label text-ink-600">
        {isUpload ? "Add a timed comment" : "Add a comment"}
      </h3>

      {isUpload ? (
        <label className="flex items-center gap-2 text-body-sm text-ink-700">
          <input
            type="checkbox"
            checked={pinCurrent}
            onChange={(e) => setPinCurrent(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300"
          />
          Comment at current time ({formatTimestamp(currentTime)})
        </label>
      ) : (
        <Input
          label="Time note (optional)"
          hint="e.g. 12:30 — shown as a label, won't control the external player"
          value={timeLabel}
          onChange={(e) => setTimeLabel(e.target.value)}
          placeholder="12:30"
        />
      )}

      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share a reflection, question, or moment…"
        maxLength={2000}
      />

      {error && <p className="text-body-sm text-error">{error}</p>}

      <Button onClick={submit} loading={submitting} disabled={!body.trim()}>
        Post comment
      </Button>
    </div>
  );
}
