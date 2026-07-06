import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { markdownToHtml } from "@/lib/utils";

type Props = {
  content: string | null;
  title: string;
  subtitle: string;
  checklistButton: string;
};

export function ParticipantGuideSection({
  content,
  title,
  subtitle,
  checklistButton,
}: Props) {
  return (
    <section>
      <h2 className="text-display-md">{title}</h2>
      <p className="mt-1 text-body-sm text-ink-600">{subtitle}</p>
      <Card tint="teal" className="mt-4">
        {content ? (
          <div
            className="prose-vpg"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
          />
        ) : (
          <p className="text-body-md text-ink-600">Guide content loading…</p>
        )}
        <div className="mt-6 border-t border-teal-100 pt-4">
          <Link href="/logistics/checklist">
            <Button variant="secondary">{checklistButton}</Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
