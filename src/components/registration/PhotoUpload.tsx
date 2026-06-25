"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UserCircle, Camera } from "@phosphor-icons/react";
import { uploadAvatar } from "@/lib/upload";
import { cn } from "@/lib/utils";

type PhotoUploadProps = {
  userId: string;
  value?: string | null;
  onChange: (url: string) => void;
  onBlur?: () => void;
  label?: string;
};

export function PhotoUpload({
  userId,
  value,
  onChange,
  onBlur,
  label = "Profile photo",
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPEG, PNG, or WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB before compression.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const url = await uploadAvatar(file, userId);
      onChange(url);
      onBlur?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-label text-ink-600">{label}</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-cream-50 bg-lavender-100 shadow-soft",
            "hover:ring-2 hover:ring-plum-500/40 focus-visible:ring-2 focus-visible:ring-plum-500/40"
          )}
          aria-label={value ? "Change photo" : "Upload photo"}
        >
          {value ? (
            <Image
              src={value}
              alt="Your profile"
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
          ) : (
            <UserCircle
              className="absolute inset-0 m-auto text-lavender-300"
              size={48}
              weight="duotone"
            />
          )}
          <span className="absolute bottom-0 right-0 rounded-full bg-plum-500 p-1.5 text-white shadow-soft">
            <Camera size={14} weight="bold" />
          </span>
        </button>
        <div className="text-body-sm text-ink-600">
          {uploading ? (
            <span className="text-teal-600">Compressing & uploading…</span>
          ) : (
            <>
              <p>Tap to upload a photo.</p>
              <p className="mt-1 text-ink-300">
                JPEG, PNG, or WebP — compressed automatically.
              </p>
            </>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="text-body-sm text-error">{error}</p>}
    </div>
  );
}
