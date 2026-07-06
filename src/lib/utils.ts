export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

function linkify(text: string): string {
  return text.replace(
    /(https?:\/\/[^\s<]+|paypal\.me\/[^\s<]+|@[\w-]+)/g,
    (match) => {
      const href = match.startsWith("@")
        ? `https://venmo.com/${match.slice(1)}`
        : match.startsWith("http")
          ? match
          : `https://${match}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-plum-500 underline hover:text-plum-700">${match}</a>`;
    }
  );
}

export function markdownToHtml(content: string): string {
  return content
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^(\d+)\. (.+)$/gm, (_, n, text) => `<li data-ordered="${n}">${linkify(text)}</li>`)
    .replace(/^- (.+)$/gm, (_, text) => `<li>${linkify(text)}</li>`)
    .replace(/(<li(?: data-ordered="\d+")?>.*<\/li>\n?)+/g, (match) => {
      const isOrdered = match.includes('data-ordered="');
      const cleaned = match.replace(/ data-ordered="\d+"/g, "");
      return isOrdered ? `<ol>${cleaned}</ol>` : `<ul>${cleaned}</ul>`;
    })
    .split(/\n\n+/)
    .map((block) => {
      if (block.startsWith("<h2") || block.startsWith("<ul") || block.startsWith("<ol")) {
        return block;
      }
      if (block.includes("|")) {
        const rows = block.split("\n").filter((r) => r.trim() && !r.match(/^\|[-| ]+\|$/));
        if (rows.length) {
          const cells = rows.map((r) =>
            r
              .split("|")
              .slice(1, -1)
              .map((c) => `<td>${linkify(c.trim())}</td>`)
              .join("")
          );
          const [head, ...body] = cells;
          return `<table class="w-full text-body-sm"><thead><tr>${head.replace(/td/g, "th")}</tr></thead><tbody>${body.map((r) => `<tr>${r}</tr>`).join("")}</tbody></table>`;
        }
      }
      return `<p>${linkify(block.replace(/\n/g, "<br/>"))}</p>`;
    })
    .join("");
}
