"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".wav",
  ".ogg",
  ".webm",
  ".mp4",
] as const;

export { MAX_UPLOAD_BYTES };

export function isAcceptedRecordingFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

let ffmpegSingleton: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

async function getFfmpeg(
  onLog?: (message: string) => void
): Promise<FFmpeg> {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;

  if (!loadPromise) {
    loadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      if (onLog) {
        ffmpeg.on("log", ({ message }) => onLog(message));
      }
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
      ffmpegSingleton = ffmpeg;
      return ffmpeg;
    })();
  }

  return loadPromise;
}

export type CompressProgress = {
  /** 0–1 */
  ratio: number;
  label: string;
};

/**
 * Strip video if present, downmix to mono Opus in a webm container at 32kbps.
 * Runs entirely in the browser via ffmpeg.wasm.
 */
export async function compressRecordingAudio(
  file: File,
  onProgress?: (progress: CompressProgress) => void
): Promise<Blob> {
  onProgress?.({ ratio: 0, label: "Loading audio tools…" });
  const ffmpeg = await getFfmpeg();

  ffmpeg.on("progress", ({ progress }) => {
    onProgress?.({
      ratio: Math.min(Math.max(progress, 0), 0.99),
      label: "Compressing audio… this can take a minute for longer recordings",
    });
  });

  const inputName = "input" + extensionFor(file);
  const outputName = "output.webm";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  onProgress?.({
    ratio: 0.02,
    label: "Compressing audio… this can take a minute for longer recordings",
  });

  const exitCode = await ffmpeg.exec([
    "-i",
    inputName,
    "-vn",
    "-ac",
    "1",
    "-c:a",
    "libopus",
    "-b:a",
    "32k",
    outputName,
  ]);

  if (exitCode !== 0) {
    throw new Error("Compression failed. Try a different file or paste a link instead.");
  }

  const data = await ffmpeg.readFile(outputName);
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);

  const blob = new Blob([bytes], { type: "audio/webm" });

  onProgress?.({ ratio: 1, label: "Compression complete" });

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      "Even after compression this file is over 30MB. Try a shorter clip, or share a link instead."
    );
  }

  return blob;
}

function extensionFor(file: File): string {
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf(".");
  if (dot >= 0) return name.slice(dot);
  if (file.type.includes("mp4")) return ".mp4";
  if (file.type.includes("mpeg")) return ".mp3";
  if (file.type.includes("wav")) return ".wav";
  return ".bin";
}
