"use client";

import { Button } from "@/components/ui/Button";

export function PrintChecklistButton({ label = "Print this checklist" }: { label?: string }) {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
