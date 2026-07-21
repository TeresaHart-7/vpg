"use client";

import { useMemo, useState } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
};

export function TagPicker({ value, onChange, suggestions }: Props) {
  const [draft, setDraft] = useState("");

  const unused = useMemo(() => {
    const selected = new Set(value.map((t) => t.toLowerCase()));
    return suggestions.filter((s) => !selected.has(s.toLowerCase()));
  }, [suggestions, value]);

  function addTag(raw: string) {
    const tag = raw.trim().replace(/^#/, "");
    if (!tag) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="space-y-2">
      <label className="text-label text-ink-600">Tags</label>
      <p className="text-body-sm text-ink-600">
        Optional — pick existing tags or type a new one and press Enter.
      </p>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="inline-flex items-center gap-1 rounded-pill bg-lavender-50 px-3 py-1 text-body-sm font-semibold text-plum-700"
            >
              {tag}
              <X size={12} weight="bold" />
            </button>
          ))}
        </div>
      )}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag(draft);
          }
        }}
        placeholder="e.g. circle, morning, music"
      />
      {unused.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {unused.slice(0, 12).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className={cn(
                "rounded-pill border border-lavender-200 bg-white px-3 py-1 text-body-sm text-ink-600",
                "hover:border-plum-300 hover:text-plum-600"
              )}
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
