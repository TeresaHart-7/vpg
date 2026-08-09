export const GATHERING_DATES = [
  { value: "2026-09-25", label: "Thu Sep 25", short: "Sep 25" },
  { value: "2026-09-26", label: "Fri Sep 26", short: "Sep 26" },
  { value: "2026-09-27", label: "Sat Sep 27", short: "Sep 27" },
  { value: "2026-09-28", label: "Sun Sep 28", short: "Sep 28" },
  { value: "2026-09-29", label: "Mon Sep 29", short: "Sep 29" },
] as const;

export const DEFAULT_DATES = GATHERING_DATES.map((d) => d.value);

export const COMING_OPTIONS = [
  { value: "yes", label: "Yes, I'm coming" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "Not this time" },
] as const;

export const CO_CREATION_DOMAINS = [
  {
    value: "unifying_ground",
    label: "Design of structures and processes to enable bridging of perspectives",
    shortLabel: "Bridging perspectives",
    icon: "Bridge",
  },
  {
    value: "schedule_design",
    label: "More concretely, what might our schedule and events look like?",
    shortLabel: "Schedule & events",
    icon: "CalendarBlank",
  },
] as const;

export const CONNECTION_LEVELS = [
  {
    value: 1,
    label: "We've met — our paths have crossed at least once.",
  },
  {
    value: 2,
    label: "We've connected a handful of times — a familiar face with some shared history.",
  },
  {
    value: 3,
    label: "We're close — there is warmth here and we've walked alongside each other over time.",
  },
  {
    value: 4,
    label: "We're very close — the inner circle, someone core to my life.",
  },
] as const;

export const PACKING_CHECKLIST = [
  "Sleeping bag or blanket + fitted sheet",
  "Pillow",
  "Towel",
  "Toiletries",
  "Refillable water bottle",
  "Indoor shoes",
  "Outdoor/hiking shoes or rain boots",
  "Warm layers (evenings can be 10–15°C)",
  "Bathing suit",
  "Sun hat",
  "Ear plugs / eye mask (if you're a light sleeper)",
  "Camp chair (optional)",
  "Games/cards (optional)",
  "Crafts to share (optional)",
] as const;

export const OPERATIONAL_SHIFTS = [
  { value: "beautifying_spaces", label: "Beautifying spaces", icon: "Flower" },
  { value: "pre_planned_events", label: "Pre-planned events", icon: "CalendarCheck" },
  { value: "childcare", label: "Helping with childcare", icon: "Baby" },
  { value: "performing_music", label: "Performing music", icon: "MusicNotes" },
  { value: "bringing_supplies", label: "Bringing supplies", icon: "Package" },
  { value: "getting_supplies", label: "Getting supplies (reimbursed)", icon: "ShoppingCart" },
  { value: "coordinating_logistics", label: "Coordinating logistics", icon: "Car" },
  { value: "volunteer_coordination", label: "Volunteer coordination", icon: "UsersThree" },
  { value: "photos_videos", label: "Photos & videos", icon: "Camera" },
  { value: "arts_crafts", label: "Arts & crafts", icon: "PaintBrush" },
  { value: "developing_tech", label: "Developing tech", icon: "Code" },
  { value: "peer_support", label: "Peer support", icon: "Heart" },
] as const;

export const REGISTRATION_STEPS = [
  { id: "profile", label: "Profile", tint: "lavender" },
  { id: "co-create", label: "Co-create", tint: "sage" },
  { id: "payments", label: "Payments", tint: "peach" },
  { id: "logistics", label: "Logistics", tint: "teal" },
] as const;

export type RegistrationStepId = (typeof REGISTRATION_STEPS)[number]["id"];

export const EVENT_DATES_DISPLAY = "Sept 25–29, 2026";
export const EVENT_LOCATION = "Camp Ki-Wa-Y, near Waterloo, ON";

export const LOGISTICS_CATEGORIES = [
  {
    id: "travel" as const,
    label: "Travel",
    description: "Rides, carpooling, and getting to camp",
    tint: "teal" as const,
    placeholder: "e.g. I can offer a ride for 2 people from Toronto on Sep 25",
  },
  {
    id: "accommodation" as const,
    label: "Accommodation",
    description: "Bedding, cabin preferences, and shared spaces",
    tint: "lavender" as const,
    placeholder: "e.g. I have extra bedding to lend",
  },
  {
    id: "supplies" as const,
    label: "Supplies",
    description: "Gear, food, and things to share",
    tint: "sage" as const,
    placeholder: "e.g. Bringing a large coffee maker for the dining hall",
  },
] as const;

export type LogisticsCategoryId = (typeof LOGISTICS_CATEGORIES)[number]["id"];

export const EVENT_SECTIONS = [
  { href: "/event/schedule", label: "Schedule", description: "Daily program" },
  { href: "/event/sessions", label: "Sessions", description: "Propose & vote on activities" },
  { href: "/recordings", label: "Recordings", description: "Audio & reflections" },
  { href: "/event/map", label: "Map", description: "Camp layout" },
] as const;
