import type { EventSchedule, ScheduleCategory } from "@/lib/types/database";

export const SCHEDULE_CATEGORY_STYLES: Record<
  ScheduleCategory,
  { tint: string; label: string }
> = {
  meal: { tint: "bg-peach-50 border-peach-200", label: "Meal" },
  open_space: { tint: "bg-sage-100 border-sage-300", label: "Open Space" },
  ceremony: { tint: "bg-lavender-50 border-lavender-200", label: "Circle" },
  free_time: { tint: "bg-teal-50 border-teal-200", label: "Free time" },
};

const VALID_CATEGORIES = new Set<string>([
  "meal",
  "open_space",
  "ceremony",
  "free_time",
]);

function slugifyDayId(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Markdown format — edit content/blocks/event_schedule.md and push to GitHub. */
export function parseEventScheduleMarkdown(raw: string): EventSchedule | null {
  const days: EventSchedule["days"] = [];
  let currentDay: EventSchedule["days"][number] | null = null;

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("<!--")) continue;

    const dayMatch = trimmed.match(/^##\s+(.+?)(?:\s*\((\d{4}-\d{2}-\d{2})\))?\s*$/);
    if (dayMatch) {
      const label = dayMatch[1].trim();
      currentDay = {
        id: dayMatch[2] ?? slugifyDayId(label),
        label,
        items: [],
      };
      days.push(currentDay);
      continue;
    }

    const itemMatch = trimmed.match(
      /^-\s+(\d{1,2}:\d{2})\s*[—–-]\s*(.+?)(?:\s*·\s*(\w+))?\s*$/
    );
    if (itemMatch && currentDay) {
      const category = itemMatch[3];
      currentDay.items.push({
        time: itemMatch[1],
        title: itemMatch[2].trim(),
        category: (category && VALID_CATEGORIES.has(category)
          ? category
          : "free_time") as ScheduleCategory,
      });
    }
  }

  return days.length ? { days } : null;
}

export function parseEventSchedule(raw: string | null): EventSchedule | null {
  if (!raw?.trim()) return null;

  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    return parseEventScheduleMarkdown(trimmed);
  }

  try {
    const parsed = JSON.parse(trimmed) as EventSchedule;
    if (!parsed?.days?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}
