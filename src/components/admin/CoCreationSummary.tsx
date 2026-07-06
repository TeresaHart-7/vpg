import { Card } from "@/components/ui/Card";
import { CO_CREATION_DOMAINS, OPERATIONAL_SHIFTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function CoCreationSummary() {
  const supabase = await createClient();

  const [{ data: coCreation }, { data: operational }, { data: profiles }] =
    await Promise.all([
      supabase.from("co_creation_interests").select("domain, profile_id"),
      supabase.from("operational_shifts").select("shift_type, profile_id"),
      supabase.from("profiles").select("id, name"),
    ]);

  const nameById = new Map(
    (profiles || []).map((p) => [p.id, p.name as string])
  );

  const domainGroups = CO_CREATION_DOMAINS.map((d) => ({
    label: d.label,
    names: (coCreation || [])
      .filter((c) => c.domain === d.value)
      .map((c) => nameById.get(c.profile_id) || "Unknown")
      .sort((a, b) => a.localeCompare(b)),
  }));

  const shiftGroups = OPERATIONAL_SHIFTS.map((s) => ({
    label: s.label,
    names: (operational || [])
      .filter((o) => o.shift_type === s.value)
      .map((o) => nameById.get(o.profile_id) || "Unknown")
      .sort((a, b) => a.localeCompare(b)),
  }));

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <Card tint="sage">
        <h2 className="text-display-sm">Co-thinking interest</h2>
        <ul className="mt-4 space-y-4">
          {domainGroups.map((d) => (
            <li key={d.label}>
              <div className="flex justify-between text-body-sm font-semibold text-ink-900">
                <span>{d.label}</span>
                <span className="text-plum-700">{d.names.length}</span>
              </div>
              {d.names.length > 0 ? (
                <p className="mt-1 text-body-sm text-ink-600">{d.names.join(", ")}</p>
              ) : (
                <p className="mt-1 text-body-sm italic text-ink-500">No one yet</p>
              )}
            </li>
          ))}
        </ul>
      </Card>
      <Card tint="lavender">
        <h2 className="text-display-sm">Operational support</h2>
        <ul className="mt-4 space-y-4">
          {shiftGroups.map((s) => (
            <li key={s.label}>
              <div className="flex justify-between text-body-sm font-semibold text-ink-900">
                <span>{s.label}</span>
                <span className="text-plum-700">{s.names.length}</span>
              </div>
              {s.names.length > 0 ? (
                <p className="mt-1 text-body-sm text-ink-600">{s.names.join(", ")}</p>
              ) : (
                <p className="mt-1 text-body-sm italic text-ink-500">No one yet</p>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
