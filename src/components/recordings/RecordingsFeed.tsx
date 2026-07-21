"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Microphone, LinkSimple } from "@phosphor-icons/react";
import type { RecordingWithAuthor } from "@/lib/types/database";
import { formatRelativeTime } from "@/lib/recordings/time";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Props = {
  recordings: RecordingWithAuthor[];
  emptyMessage: string;
};

export function RecordingsFeed({ recordings, emptyMessage }: Props) {
  const [authorFilter, setAuthorFilter] = useState<string>("");
  const [authorQuery, setAuthorQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const authors = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of recordings) {
      map.set(r.profile_id, r.profiles?.name || "Unknown");
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [recordings]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const r of recordings) {
      for (const t of r.tags || []) set.add(t);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [recordings]);

  const filteredAuthors = useMemo(() => {
    const q = authorQuery.trim().toLowerCase();
    if (!q) return authors;
    return authors.filter((a) => a.name.toLowerCase().includes(q));
  }, [authors, authorQuery]);

  const filtered = useMemo(() => {
    return recordings.filter((r) => {
      if (authorFilter && r.profile_id !== authorFilter) return false;
      if (selectedTags.length > 0) {
        const tags = r.tags || [];
        if (!selectedTags.every((t) => tags.includes(t))) return false;
      }
      return true;
    });
  }, [recordings, authorFilter, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-sm text-ink-600">
          {filtered.length} recording{filtered.length === 1 ? "" : "s"}
        </p>
        <Link href="/recordings/new">
          <Button size="sm">Share a recording</Button>
        </Link>
      </div>

      {(authors.length > 1 || allTags.length > 0) && (
        <Card tint="cream" className="space-y-4 !p-4">
          <div className="space-y-2">
            <label className="text-label text-ink-600">Filter by person</label>
            <Input
              value={authorQuery}
              onChange={(e) => setAuthorQuery(e.target.value)}
              placeholder="Search names…"
            />
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={!authorFilter}
                onClick={() => setAuthorFilter("")}
                label="Everyone"
              />
              {filteredAuthors.map((a) => (
                <FilterChip
                  key={a.id}
                  active={authorFilter === a.id}
                  onClick={() =>
                    setAuthorFilter((prev) => (prev === a.id ? "" : a.id))
                  }
                  label={a.name}
                />
              ))}
            </div>
          </div>
          {allTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-label text-ink-600">Filter by tag</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <FilterChip
                    key={tag}
                    active={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                    label={tag}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body-md text-ink-600">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((recording) => (
            <li key={recording.id}>
              <Link href={`/recordings/${recording.id}`}>
                <Card
                  tint="white"
                  className="transition-transform hover:-translate-y-0.5 !p-4 sm:!p-5"
                >
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lavender-50 text-plum-600">
                      {recording.source_type === "upload" ? (
                        <Microphone size={24} weight="duotone" />
                      ) : (
                        <LinkSimple size={24} weight="duotone" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-display-sm text-ink-900">
                        {recording.title}
                      </h2>
                      <p className="mt-1 text-body-sm text-ink-600">
                        {recording.profiles?.name || "Unknown"} ·{" "}
                        {formatRelativeTime(recording.created_at)}
                        {typeof recording.comment_count === "number" && (
                          <>
                            {" "}
                            · {recording.comment_count} comment
                            {recording.comment_count === 1 ? "" : "s"}
                          </>
                        )}
                      </p>
                      {recording.description && (
                        <p className="mt-2 line-clamp-2 text-body-sm text-ink-700">
                          {recording.description}
                        </p>
                      )}
                      {(recording.tags?.length ?? 0) > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {recording.tags!.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-pill bg-cream-100 px-2.5 py-0.5 text-body-sm text-ink-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill px-3 py-1.5 text-body-sm font-semibold transition-colors",
        active
          ? "bg-plum-500 text-white"
          : "bg-white text-ink-600 hover:text-plum-600"
      )}
    >
      {label}
    </button>
  );
}
