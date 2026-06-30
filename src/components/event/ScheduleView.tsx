"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SCHEDULE_CATEGORY_STYLES } from "@/lib/schedule";
import type { EventSchedule } from "@/lib/types/database";

type Props = {
  schedule: EventSchedule;
};

export function ScheduleView({ schedule }: Props) {
  const [activeDay, setActiveDay] = useState(schedule.days[0]?.id ?? "");
  const day = schedule.days.find((d) => d.id === activeDay) ?? schedule.days[0];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {schedule.days.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActiveDay(d.id)}
            className={cn(
              "shrink-0 rounded-pill px-4 py-2 text-body-sm font-semibold transition-colors",
              activeDay === d.id
                ? "bg-white text-plum-700 shadow-soft"
                : "bg-lavender-50 text-ink-600 hover:text-plum-500"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {day && (
        <ol className="relative space-y-4 border-l-2 border-lavender-200 pl-6">
          {day.items.map((item, i) => {
            const style = SCHEDULE_CATEGORY_STYLES[item.category];
            return (
              <li key={`${item.time}-${i}`} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full bg-plum-400 ring-4 ring-cream-50" />
                <div
                  className={cn(
                    "rounded-md border px-4 py-3",
                    style.tint
                  )}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-body-sm font-semibold text-plum-700">
                      {item.time}
                    </span>
                    <span className="text-body-sm text-ink-600">{style.label}</span>
                  </div>
                  <p className="mt-1 text-body-md font-semibold text-ink-900">
                    {item.title}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
