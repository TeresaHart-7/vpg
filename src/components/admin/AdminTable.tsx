"use client";

import { useState } from "react";
import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react";
import type { Profile, LinkedGuest } from "@/lib/types/database";
import { formatDates, getPaymentStatus } from "@/lib/types/database";
import { PaymentBadge, ComingBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";

type AdminRow = Profile & {
  linked_guests: Pick<LinkedGuest, "name">[];
};

const ALL_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "dates", label: "Coming dates" },
  { key: "paid", label: "Paid" },
  { key: "bio", label: "Bio added" },
  { key: "linked_guests", label: "Linked guests" },
  { key: "is_coming", label: "Coming?" },
  { key: "location_from", label: "Location" },
  { key: "dietary_restrictions", label: "Dietary" },
] as const;

type ColumnKey = (typeof ALL_COLUMNS)[number]["key"];

const DEFAULT_VISIBLE: ColumnKey[] = [
  "name",
  "email",
  "dates",
  "paid",
  "bio",
  "linked_guests",
];

export function AdminTable({ profiles }: { profiles: AdminRow[] }) {
  const [visibleColumns, setVisibleColumns] =
    useState<ColumnKey[]>(DEFAULT_VISIBLE);
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const renderCell = (profile: AdminRow, key: ColumnKey) => {
    switch (key) {
      case "name":
        return profile.name || "—";
      case "email":
        return profile.email || "—";
      case "dates":
        return formatDates(profile.dates);
      case "paid":
        return <PaymentBadge profile={profile} />;
      case "bio":
        return profile.bio?.trim() ? "Yes" : "No";
      case "linked_guests":
        return profile.linked_guests?.map((g) => g.name).join(", ") || "—";
      case "is_coming":
        return profile.is_coming ? (
          <ComingBadge isComing={profile.is_coming} />
        ) : (
          "—"
        );
      case "location_from":
        return profile.location_from || "—";
      case "dietary_restrictions":
        return profile.dietary_restrictions || "—";
      default:
        return "—";
    }
  };

  const paidCount = profiles.filter(
    (p) => getPaymentStatus(p) === "paid"
  ).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-body-sm text-ink-600">
          {profiles.length} registrants · {paidCount} paid
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowColumnPicker(true)}
        >
          Columns
        </Button>
      </div>

      <Card className="overflow-hidden bg-white p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-body-sm">
            <thead className="bg-cream-100">
              <tr>
                {ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key)).map(
                  (col) => (
                    <th
                      key={col.key}
                      className="whitespace-nowrap px-4 py-3 font-semibold text-ink-900"
                    >
                      {col.label}
                    </th>
                  )
                )}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="border-t border-lavender-100 hover:bg-lavender-50"
                >
                  {ALL_COLUMNS.filter((c) =>
                    visibleColumns.includes(c.key)
                  ).map((col) => (
                    <td key={col.key} className="px-4 py-3 text-ink-600">
                      {renderCell(profile, col.key)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/edit/${profile.id}`}
                      className="inline-flex items-center gap-1 rounded-sm p-2 text-plum-500 hover:bg-plum-100"
                      aria-label={`Edit ${profile.name}`}
                    >
                      <PencilSimple size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={showColumnPicker}
        onClose={() => setShowColumnPicker(false)}
        title="Choose columns"
      >
        <div className="space-y-3">
          {ALL_COLUMNS.map((col) => (
            <Checkbox
              key={col.key}
              label={col.label}
              checked={visibleColumns.includes(col.key)}
              onChange={() => toggleColumn(col.key)}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}
