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
    label: "How do we create a unifying ground?",
    icon: "GlobeHemisphereWest",
  },
  {
    value: "bridging_pedagogy",
    label: 'What might a pedagogy around "bridging" look like?',
    icon: "Bridge",
  },
  {
    value: "schedule_design",
    label: "What might our schedule look like? What pre-planned events do we want?",
    icon: "CalendarBlank",
  },
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
