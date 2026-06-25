import { Card } from "@/components/ui/Card";
import { CO_CREATION_DOMAINS, OPERATIONAL_SHIFTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function CoCreationSummary() {
  const supabase = await createClient();

  const [{ data: coCreation }, { data: operational }] = await Promise.all([
    supabase.from("co_creation_interests").select("domain, profile_id"),
    supabase.from("operational_shifts").select("shift_type, profile_id"),
  ]);

  const domainCounts = CO_CREATION_DOMAINS.map((d) => ({
    label: d.label,
    count: (coCreation || []).filter((c) => c.domain === d.value).length,
  }));

  const shiftCounts = OPERATIONAL_SHIFTS.map((s) => ({
    label: s.label,
    count: (operational || []).filter((o) => o.shift_type === s.value).length,
  }));

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <Card tint="sage">
        <h2 className="text-display-sm">Co-thinking interest</h2>
        <ul className="mt-4 space-y-2">
          {domainCounts.map((d) => (
            <li
              key={d.label}
              className="flex justify-between text-body-sm text-ink-600"
            >
              <span>{d.label}</span>
              <span className="font-semibold text-plum-700">{d.count}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card tint="lavender">
        <h2 className="text-display-sm">Operational support</h2>
        <ul className="mt-4 space-y-2">
          {shiftCounts.map((s) => (
            <li
              key={s.label}
              className="flex justify-between text-body-sm text-ink-600"
            >
              <span>{s.label}</span>
              <span className="font-semibold text-plum-700">{s.count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
