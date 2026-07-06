import {
  TreeStructure,
  Mountains,
  Target,
  Ladder,
  Waves,
  ChatsCircle,
} from "@phosphor-icons/react/dist/ssr";

const ACTIVITIES = [
  {
    icon: TreeStructure,
    title: "Low ropes",
    description: "Team challenges close to the ground.",
  },
  {
    icon: Mountains,
    title: "Rock climbing",
    description: "Climbing wall with staff support.",
  },
  {
    icon: Target,
    title: "Archery",
    description: "Learn and practice with guidance.",
  },
  {
    icon: Ladder,
    title: "High ropes",
    description: "Elevated course for the adventurous.",
  },
  {
    icon: Waves,
    title: "Waterfront",
    description: "Canoes, kayaks, and swimming at designated times.",
  },
  {
    icon: ChatsCircle,
    title: "Open Space",
    description: "Anyone can host an activity or conversation.",
  },
] as const;

export function CampActivitiesList() {
  return (
    <div className="space-y-3">
      <p className="text-body-md text-ink-600">
        Staff-led activities offered at designated times each afternoon.
      </p>
      <ul className="space-y-3">
        {ACTIVITIES.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-100 text-teal-700">
              <Icon size={20} weight="duotone" />
            </span>
            <div>
              <p className="text-body-md font-semibold text-ink-900">{title}</p>
              <p className="text-body-sm text-ink-600">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
