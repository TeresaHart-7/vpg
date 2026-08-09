const MAILTO_MAX_LENGTH = 1800;

/**
 * Build a mailto: URL with BCC only (empty To).
 * Opens the user's default mail handler. BCC support varies by client —
 * Gmail's mailto handler often drops it; Copy remains the reliable path.
 */
export function buildMailtoBcc(emails: string[]): string | null {
  const cleaned = [
    ...new Set(emails.map((e) => e.trim()).filter(Boolean)),
  ];
  if (!cleaned.length) return null;

  // RFC 6068: comma-separated. Do not percent-encode `@` — some clients
  // treat a%40b.com as invalid and clear the field.
  const href = `mailto:?bcc=${cleaned.join(",")}`;
  if (href.length > MAILTO_MAX_LENGTH) return null;
  return href;
}

export { MAILTO_MAX_LENGTH };
