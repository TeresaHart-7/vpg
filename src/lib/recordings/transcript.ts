import { parseTimestampLabel } from "./time";

export type TranscriptSegment = {
  startSeconds: number | null;
  text: string;
};

/**
 * Split transcript into segments. Lines/paragraphs starting with [MM:SS]
 * become timed segments; otherwise startSeconds is null.
 */
export function parseTranscript(transcript: string): TranscriptSegment[] {
  const blocks = transcript
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return blocks.map((line) => {
    const match = line.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*)$/);
    if (match) {
      return {
        startSeconds: parseTimestampLabel(match[1]),
        text: match[2] || "",
      };
    }
    return { startSeconds: null, text: line };
  });
}

export function hasTimedTranscript(segments: TranscriptSegment[]): boolean {
  return segments.some((s) => s.startSeconds !== null);
}

/** Index of the segment that should be active at `currentTime`. */
export function activeSegmentIndex(
  segments: TranscriptSegment[],
  currentTime: number
): number {
  let active = -1;
  for (let i = 0; i < segments.length; i++) {
    const start = segments[i].startSeconds;
    if (start !== null && start <= currentTime) {
      active = i;
    }
  }
  return active;
}
