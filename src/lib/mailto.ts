const MAILTO_MAX_LENGTH = 1800;

/** Build a mailto: URL with BCC only. Returns null if over the length limit. */
export function buildMailtoBcc(emails: string[]): string | null {
  if (!emails.length) return null;
  const href = `mailto:?bcc=${emails.map(encodeURIComponent).join(",")}`;
  if (href.length > MAILTO_MAX_LENGTH) return null;
  return href;
}

export { MAILTO_MAX_LENGTH };
