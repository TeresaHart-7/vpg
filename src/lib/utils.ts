export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
export function markdownToHtml(content: string): string {
  return content
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .split(/\n\n+/)
    .map((block) => {
      if (block.startsWith("<h2") || block.startsWith("<ul")) return block;
      return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");
}
