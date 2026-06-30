import { markdownToHtml } from "@/lib/utils";

type Props = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: Props) {
  return (
    <div
      className={className ?? "prose-vpg"}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
    />
  );
}
