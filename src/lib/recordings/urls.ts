import { createClient } from "@/lib/supabase/client";

export function getRecordingPublicUrl(storagePath: string): string {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from("recordings").getPublicUrl(storagePath);
  return publicUrl;
}

export function getRecordingPublicUrlServer(
  storagePath: string,
  supabaseUrl: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/recordings/${storagePath}`;
}
