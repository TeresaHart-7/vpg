"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadRecordingAudio } from "@/lib/recordings/upload";
import { TagPicker } from "@/components/recordings/TagPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

type SourceMode = "upload" | "link";

type Props = {
  myProfileId: string;
  userId: string;
  tagSuggestions: string[];
};

export function RecordingForm({
  myProfileId,
  userId,
  tagSuggestions,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<SourceMode>("upload");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [transcript, setTranscript] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [compressProgress, setCompressProgress] = useState<number | null>(null);
  const [compressLabel, setCompressLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please add a title.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      if (mode === "link") {
        const url = externalUrl.trim();
        if (!url) {
          throw new Error("Paste a link to the recording.");
        }
        try {
          // Validate URL shape
          new URL(url);
        } catch {
          throw new Error("That doesn’t look like a valid URL.");
        }

        const { data, error: insertError } = await supabase
          .from("recordings")
          .insert({
            profile_id: myProfileId,
            title: title.trim(),
            description: description.trim() || null,
            source_type: "link",
            external_url: url,
            transcript: transcript.trim() || null,
            tags,
          })
          .select("id")
          .single();

        if (insertError || !data) throw insertError || new Error("Insert failed");
        router.push(`/recordings/${data.id}`);
        return;
      }

      // Path A — upload (compress first, then store). Lazy-load ffmpeg.wasm.
      if (!file) {
        throw new Error("Choose an audio or video file to upload.");
      }

      const {
        compressRecordingAudio,
        isAcceptedRecordingFile,
        MAX_UPLOAD_BYTES,
      } = await import("@/lib/recordings/compress");

      if (!isAcceptedRecordingFile(file)) {
        throw new Error("Use mp3, m4a, wav, ogg, webm, or mp4.");
      }

      const recordingId = crypto.randomUUID();

      const blob = await compressRecordingAudio(file, ({ ratio, label }) => {
        setCompressProgress(ratio);
        setCompressLabel(label);
      });

      if (blob.size > MAX_UPLOAD_BYTES) {
        throw new Error(
          "Even after compression this file is over 30MB. Try a shorter clip, or share a link instead."
        );
      }

      setCompressLabel("Uploading…");
      const path = await uploadRecordingAudio(blob, userId, recordingId);

      const { data, error: insertError } = await supabase
        .from("recordings")
        .insert({
          id: recordingId,
          profile_id: myProfileId,
          title: title.trim(),
          description: description.trim() || null,
          source_type: "upload",
          storage_path: path,
          transcript: transcript.trim() || null,
          tags,
        })
        .select("id")
        .single();

      if (insertError || !data) {
        try {
          await supabase.storage.from("recordings").remove([path]);
        } catch {
          // best-effort cleanup
        }
        throw insertError || new Error("Insert failed");
      }

      router.push(`/recordings/${data.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again?";
      setError(message);
      setSubmitting(false);
      setCompressProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-label text-ink-600">How will you share?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeCard
            active={mode === "upload"}
            onClick={() => setMode("upload")}
            title="Upload a file"
            hint="Best experience — timed comments that seek the player. We compress in your browser first."
          />
          <ModeCard
            active={mode === "link"}
            onClick={() => setMode("link")}
            title="Paste a link"
            hint="Otter, Drive, etc. Faster to share; comments can note a time but won’t control playback."
          />
        </div>
      </fieldset>

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="e.g. Morning circle — Saturday"
      />

      <Textarea
        label="Description"
        hint="Optional context for listeners"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={2000}
        placeholder="What was this moment about?"
      />

      {mode === "upload" ? (
        <div className="space-y-2">
          <label className="text-label text-ink-600">Audio or video file</label>
          <p className="text-body-sm text-ink-600">
            mp3, m4a, wav, ogg, or mp4 (video track is stripped). Compressed to
            mono Opus before upload.
          </p>
          <input
            type="file"
            accept=".mp3,.m4a,.wav,.ogg,.webm,.mp4,audio/*,video/mp4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-body-sm text-ink-700 file:mr-3 file:rounded-md file:border-0 file:bg-plum-500 file:px-4 file:py-2 file:text-body-sm file:font-semibold file:text-white"
          />
          {file && (
            <p className="text-body-sm text-ink-600">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          )}
        </div>
      ) : (
        <Input
          label="Link"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          placeholder="https://…"
          hint="Google Drive links embed in-app; other links open in a new tab."
        />
      )}

      <TagPicker
        value={tags}
        onChange={setTags}
        suggestions={tagSuggestions}
      />

      <Textarea
        label="Transcript (optional)"
        hint="Paste or type freely. Start a line with [MM:SS] to sync with playback on uploaded audio."
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        maxLength={100000}
        className="min-h-[160px]"
        placeholder={"[00:00] Welcome everyone…\n[01:20] The question we sat with…"}
      />

      {compressProgress !== null && (
        <div className="space-y-2 rounded-md bg-lavender-50 p-4">
          <p className="text-body-sm text-ink-700">{compressLabel}</p>
          <div className="h-2 overflow-hidden rounded-full bg-lavender-200">
            <div
              className="h-full rounded-full bg-plum-500 transition-[width] duration-200"
              style={{ width: `${Math.round(compressProgress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-body-sm text-error">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={submitting}>
          Share recording
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/recordings")}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ModeCard({
  active,
  onClick,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border-2 p-4 text-left transition-colors",
        active
          ? "border-plum-500 bg-lavender-50"
          : "border-lavender-200 bg-white hover:border-plum-300"
      )}
    >
      <span className="text-body-md font-semibold text-ink-900">{title}</span>
      <p className="mt-1 text-body-sm text-ink-600">{hint}</p>
    </button>
  );
}
