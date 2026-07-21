const DRIVE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/]+)/i,
  /drive\.google\.com\/open\?id=([^&]+)/i,
  /docs\.google\.com\/.*?[?&]id=([^&]+)/i,
  /drive\.google\.com\/uc\?.*?id=([^&]+)/i,
];

/** Extract a Google Drive file ID from a share URL, if present. */
export function extractDriveFileId(url: string): string | null {
  for (const pattern of DRIVE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function drivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function isDriveUrl(url: string): boolean {
  return extractDriveFileId(url) !== null;
}

/** Hostname for "Listen on [domain]" cards */
export function displayDomain(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("otter.ai")) return "Otter";
    if (host.includes("drive.google")) return "Google Drive";
    return host;
  } catch {
    return "external link";
  }
}
