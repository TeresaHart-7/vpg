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

export function parseEventSchedule(raw: string | null): EventSchedule | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as EventSchedule;
    if (!parsed?.days?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}
