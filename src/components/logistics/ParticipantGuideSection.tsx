import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CampActivitiesList } from "@/components/logistics/CampActivitiesList";
import { markdownToHtml } from "@/lib/utils";

type Section = { title: string; body: string };

type Props = {
  content: string | null;
  title: string;
  subtitle: string;
  checklistButton: string;
};

const CAMP_ACTIVITIES_HEADING = "Camp activities (staff-led)";
const WHAT_TO_BRING_HEADING = "What to bring";

function splitSections(content: string): Section[] {
  const chunks = content.split(/^## /gm).filter(Boolean);
  return chunks.map((chunk) => {
    const newline = chunk.indexOf("\n");
    if (newline === -1) return { title: chunk.trim(), body: "" };
    return {
      title: chunk.slice(0, newline).trim(),
      body: chunk.slice(newline + 1).trim(),
    };
  });
}

export function ParticipantGuideSection({
  content,
  title,
  subtitle,
  checklistButton,
}: Props) {
  const sections = content ? splitSections(content) : [];

  return (
    <section>
      <h2 className="text-display-md">{title}</h2>
      <p className="mt-1 text-body-sm text-ink-600">{subtitle}</p>
      <Card tint="teal" className="mt-4 space-y-8">
        {!content ? (
          <p className="text-body-md text-ink-600">Guide content loading…</p>
        ) : (
          sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-display-sm">{section.title}</h3>
              {section.title === CAMP_ACTIVITIES_HEADING ? (
                <div className="mt-3">
                  <CampActivitiesList />
                </div>
              ) : (
                <div
                  className="prose-vpg mt-3"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(section.body) }}
                />
              )}
              {section.title === WHAT_TO_BRING_HEADING && (
                <div className="mt-6 border-t border-teal-100 pt-4">
                  <Link href="/logistics/checklist">
                    <Button variant="secondary">{checklistButton}</Button>
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </Card>
    </section>
  );
}
