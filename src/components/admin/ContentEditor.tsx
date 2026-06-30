"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

type Block = {
  key: string;
  label: string;
  hint: string;
  rows?: number;
};

const EDITABLE_BLOCKS: Block[] = [
  {
    key: "event_schedule",
    label: "Event schedule (JSON)",
    hint: "Structured schedule for /event/schedule. Must be valid JSON with a days array.",
    rows: 16,
  },
  {
    key: "camp_map",
    label: "Camp map (JSON)",
    hint: 'e.g. {"imageUrl":"/camp-map.svg","caption":"..."}',
    rows: 4,
  },
  {
    key: "camp_agreements",
    label: "Camp agreements (markdown)",
    hint: "Markdown shown on /event/agreements",
    rows: 12,
  },
];

type Props = {
  blocks: Record<string, string>;
};

export function ContentEditor({ blocks }: Props) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(blocks);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function save(key: string) {
    setSaving(key);
    setError(null);
    setSaved(null);
    const content = drafts[key] ?? "";

    if (key === "event_schedule" || key === "camp_map") {
      try {
        JSON.parse(content);
      } catch {
        setError(`${key} must be valid JSON`);
        setSaving(null);
        return;
      }
    }

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("admin_content_blocks")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (updateError) throw updateError;
      setSaved(key);
      router.refresh();
    } catch {
      setError("Could not save. Check your connection and admin permissions.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      {EDITABLE_BLOCKS.map((block) => (
        <Card key={block.key} tint="white">
          <h2 className="text-display-sm">{block.label}</h2>
          <p className="mt-1 text-body-sm text-ink-600">{block.hint}</p>
          <Textarea
            className="mt-4 min-h-[200px] font-mono text-body-sm"
            value={drafts[block.key] ?? ""}
            onChange={(e) =>
              setDrafts((d) => ({ ...d, [block.key]: e.target.value }))
            }
            maxLength={20000}
          />
          <Button
            type="button"
            className="mt-4"
            loading={saving === block.key}
            onClick={() => save(block.key)}
          >
            Save {block.label.split(" ")[0].toLowerCase()}
          </Button>
          {saved === block.key && (
            <p className="mt-2 text-body-sm text-sage-600">Saved.</p>
          )}
        </Card>
      ))}
      {error && <p className="text-body-sm text-error">{error}</p>}
    </div>
  );
}
