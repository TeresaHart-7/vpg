"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DateChipSelector } from "@/components/ui/DateChipSelector";
import { ConnectionStrength } from "@/components/ui/ConnectionStrength";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { GATHERING_DATES, DEFAULT_DATES } from "@/lib/constants";
import { BlobOne, BlobTwo } from "@/components/decorative/Blobs";

export default function StyleGuidePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [dates, setDates] = useState<string[]>([...DEFAULT_DATES]);
  const [bio, setBio] = useState("A short bio for testing the character counter.");
  const [strength, setStrength] = useState(2);

  return (
    <div className="relative min-h-screen bg-cream-50 px-4 py-12 sm:px-6">
      <BlobOne className="left-0 top-0 h-48 w-48" />
      <BlobTwo className="bottom-0 right-0 h-56 w-56" color="peach" />

      <div className="relative mx-auto max-w-4xl space-y-12">
        <header>
          <p className="text-label text-teal-600">Dev only</p>
          <h1 className="text-display-xl">Style guide</h1>
          <p className="text-body-md text-ink-600">
            Misty Forest × Meadow Bloom design system
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-display-md">Typography</h2>
          <p className="text-display-xl">Display XL</p>
          <p className="text-display-lg">Display LG</p>
          <p className="text-display-md">Display MD</p>
          <p className="text-display-sm">Display SM</p>
          <p className="text-body-lg">Body large — intro paragraphs</p>
          <p className="text-body-md">Body medium — default text</p>
          <p className="text-body-sm">Body small — captions</p>
          <p className="text-label">Label token</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-display-md">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-display-md">Form fields</h2>
          <Card>
            <div className="space-y-4">
              <Input label="Text input" placeholder="Your name" />
              <Textarea
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <Checkbox label="Plain checkbox" />
              <Checkbox tile selected label="Tile checkbox selected" />
              <DateChipSelector
                dates={GATHERING_DATES}
                selected={dates}
                onChange={setDates}
              />
              <ConnectionStrength value={strength} onChange={setStrength} />
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-display-md">Status badges</h2>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="paid" />
            <StatusBadge status="pending" />
            <StatusBadge status="coming" />
            <StatusBadge status="maybe" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-display-md">Cards (tints)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card tint="lavender">Lavender</Card>
            <Card tint="sage">Sage</Card>
            <Card tint="peach">Peach</Card>
            <Card tint="teal">Teal</Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-display-md">Overlays</h2>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
            <Button variant="secondary" onClick={() => setToast(true)}>
              Show toast
            </Button>
          </div>
        </section>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example modal">
        <p className="text-body-md text-ink-600">Modal content goes here.</p>
      </Modal>
      {toast && (
        <Toast message="Saved successfully!" type="success" onDismiss={() => setToast(false)} />
      )}
    </div>
  );
}
