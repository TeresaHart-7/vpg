"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CONNECTION_LEVELS } from "@/lib/constants";
import { ConnectionStrength } from "@/components/ui/ConnectionStrength";

type ConnectionLevel = { value: number; label: string };

type Props = {
  open: boolean;
  onClose: () => void;
  personName: string;
  initialStrength: number;
  onSave: (strength: number) => Promise<void>;
  onCelebration?: () => void;
  intro?: string;
  levels?: ConnectionLevel[];
};

export function ConnectionModal({
  open,
  onClose,
  personName,
  initialStrength,
  onSave,
  onCelebration,
  intro = "No relationship fits neatly into a box. Pick whichever level feels closest, and don't overthink it.",
  levels = [...CONNECTION_LEVELS],
}: Props) {
  const [strength, setStrength] = useState(initialStrength || 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setStrength(initialStrength || 0);
  }, [open, initialStrength]);

  const handleSave = async () => {
    if (strength <= 0) return;
    setSaving(true);
    try {
      await onSave(strength);
      onCelebration?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Your connection to ${personName.split(" ")[0]}`}
    >
      <p className="text-body-sm text-ink-600">{intro}</p>

      <div className="mt-4">
        <label htmlFor="connection-level" className="text-label text-ink-600">
          Connection strength
        </label>
        <select
          id="connection-level"
          value={strength || ""}
          onChange={(e) => setStrength(Number(e.target.value))}
          className="mt-1.5 w-full rounded-sm border border-ink-300 bg-white px-4 py-3 text-body-md text-ink-900"
        >
          <option value="" disabled>
            Choose a level…
          </option>
          {levels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.value} — {level.label}
            </option>
          ))}
        </select>
      </div>

      {strength > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-body-sm text-ink-600">Preview</p>
          <ConnectionStrength value={strength} readOnly showNumber />
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" loading={saving} disabled={strength <= 0} onClick={handleSave}>
          Save connection
        </Button>
      </div>
    </Modal>
  );
}
