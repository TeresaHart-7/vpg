import { createClient } from "@/lib/supabase/client";

export async function uploadRecordingAudio(
  blob: Blob,
  userId: string,
  recordingId: string
): Promise<string> {
  const supabase = createClient();
  const path = `${userId}/${recordingId}.webm`;

  const { error } = await supabase.storage.from("recordings").upload(path, blob, {
    upsert: true,
    contentType: "audio/webm",
    cacheControl: "3600",
  });

  if (error) throw error;
  return path;
}

export async function deleteRecordingAudio(storagePath: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from("recordings").remove([storagePath]);
  if (error) throw error;
}
