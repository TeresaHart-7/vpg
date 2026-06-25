import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_MB = 0.4;
const MAX_DIMENSION = 800;

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    fileType: "image/webp",
  });
}

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {
  const compressed = await compressImage(file);
  const supabase = createClient();
  const path = `${userId}/avatar.webp`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, compressed, {
      upsert: true,
      contentType: "image/webp",
      cacheControl: "3600",
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  return `${publicUrl}?t=${Date.now()}`;
}
