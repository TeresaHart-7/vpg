"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { EVENT_SECTIONS } from "@/lib/constants";

export function EventSubnav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <Link
        href="/event"
        className={cn(
          "shrink-0 rounded-pill px-4 py-2 text-body-sm font-semibold transition-colors",
          pathname === "/event"
            ? "bg-plum-500 text-white"
            : "bg-lavender-50 text-ink-600 hover:text-plum-500"
        )}
      >
        Overview
      </Link>
      {EVENT_SECTIONS.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={cn(
            "shrink-0 rounded-pill px-4 py-2 text-body-sm font-semibold transition-colors",
            pathname === section.href || pathname.startsWith(section.href + "/")
              ? "bg-plum-500 text-white"
              : "bg-lavender-50 text-ink-600 hover:text-plum-500"
          )}
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
