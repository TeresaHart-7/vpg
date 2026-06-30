import { MarkdownContent } from "@/components/event/MarkdownContent";
import {
  Moon,
  Leaf,
  Waves,
  Camera,
  Prohibit,
} from "@phosphor-icons/react/dist/ssr";

const AGREEMENT_ICONS = [
  { match: /quiet hours/i, icon: Moon },
  { match: /smoke|drug|alcohol/i, icon: Prohibit },
  { match: /nut-free/i, icon: Leaf },
  { match: /waterfront|lifeguard/i, icon: Waves },
  { match: /photo|video|consent/i, icon: Camera },
];

type Props = {
  content: string;
};

export function AgreementsView({ content }: Props) {
  const [agreementsSection, tipsSection] = content.split("## Camp tips");
  const agreementLines = agreementsSection
    .split("\n")
    .filter((line) => line.trim().startsWith("- **"));

  return (
    <div className="space-y-8">
      <ul className="space-y-5">
        {agreementLines.map((line) => {
          const text = line.replace(/^- /, "").replace(/\*\*/g, "");
          const Icon =
            AGREEMENT_ICONS.find((entry) => entry.match.test(text))?.icon ??
            Leaf;
          return (
            <li key={line} className="flex gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lavender-50 text-plum-600">
                <Icon size={22} weight="duotone" />
              </span>
              <p className="text-body-lg text-ink-900">{text}</p>
            </li>
          );
        })}
      </ul>
      {tipsSection && (
        <div className="rounded-md bg-cream-100 p-4">
          <MarkdownContent content={`## Camp tips${tipsSection}`} />
        </div>
      )}
    </div>
  );
}
