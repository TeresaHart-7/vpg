import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "content");
const blocks = path.join(root, "blocks");
const pages = path.join(root, "pages");
fs.mkdirSync(blocks, { recursive: true });
fs.mkdirSync(pages, { recursive: true });

const writeMd = (name, body) =>
  fs.writeFileSync(path.join(blocks, `${name}.md`), body.trim() + "\n");

writeMd(
  "orienting_artifact",
  `## Purpose

The purpose of the Village Playground gathering is to **explore and practice villaging together**.

For us, villaging is the practice of cultivating interdependent, high-trust relationships of mutual support and thrival.

## Principles

- **Care for all beings**
- **Follow the aliveness**
- **Welcome everything as learning**
- **Participate with the system's flow**
- **Expand your perspective**

## Practices

**Practice 1: Noticing and naming** — Listen to my body, feelings and thoughts; share with "I" statements.

**Practice 2: Welcoming and integrating** — Turn towards experience with curiosity; see a whole that includes all parts.

**Practice 3: Law of two feet** — Trust my body; move to where I can learn, participate and have fun.`
);

writeMd(
  "payment_instructions",
  `## Registration costs

- **$400 CAD** — full event
- **$350 CAD** — children ages 5–18
- Children under 5 are free
- USD equivalents: **$320 USD** for adults · **$250 USD** for kids

If you need to pay less, or want to contribute more, say so below — we want you here.

## How to pay (in order of preference)

1. **Interac e-transfer (preferred for Canadians):** tessmhart@gmail.com
2. **Wise:** [teresah396](https://wise.com/pay/me/teresah396) (USD or CAD)
3. **PayPal CAD:** https://paypal.me/pathwaystosource
4. **PayPal USD:** https://paypal.me/bakejam
5. **Venmo USD:** @james-a-baker

## After paying

Check **"I have sent my payment"** in your profile, or **"I will pay by Aug 31"** if you're committing to pay soon. These checkboxes are how the host crew tracks payment status.`
);

writeMd(
  "participant_guide",
  `## Dates & times (2026)

- Gathering **Sept 25 – Sept 29, 2026**
- Gathering begins **Sept 25 evening**
- Full days **Sept 26–28**
- Main gathering concludes **Sept 29 @ 1pm**

## Location

**Camp Ki-Wa-Y**
3738 Hessen Strasse, St. Clements, ON N0B 2M0
(Right outside Waterloo, Ontario — ~1 hr from Toronto Pearson)

Please reach out to the host crew before calling the camp directly.

## Getting there

| From | To | Option | Notes |
|------|-----|--------|-------|
| Toronto Union | Kitchener | GO Train | ~2 hrs |
| Pearson | UW | GO Bus | ~2 hrs, 1 transfer |
| Kitchener terminal | Camp | Uber/Lyft | ~35 min — split with others! |
| Toronto / Pearson | Camp | Uber/Lyft | 1–1.5 hrs — split with others! |

Carpool coordination will happen in the Coordination section below once you're registered.

## Accommodations

- Bunk beds in cabins (rooms of 6–12 people) — bring your own sheets and pillow
- Some tenting available — let us know in registration if you can tent
- Tell us who you'd like to bunk with when you register

## Food

Healthy, kid-friendly meals prepared by camp staff 3× daily. Vibrant salad bar at lunch and dinner. Snacks available 24hrs in the Sanctuary.

The facility is **nut-free** in public spaces. Let us know dietary restrictions in registration.

## Technology

We're here for quality time in nature — internet and electronics are discouraged. Wi-Fi is available in the dining hall (Paradise Post). Mediocre cell service throughout the land.

## What to bring

- Sleeping bag or blanket + fitted sheet, pillow
- Towel, toiletries, refillable water bottle
- Indoor shoes, outdoor/hiking shoes or rain boots
- Warm layers (evenings can be 10–15°C), bathing suit, sun hat
- Ear plugs / eye mask if you're a light sleeper
- Optional: camp chair, games/cards, crafts to share

## Camp activities (staff-led)

Low ropes, rock climbing, archery, high ropes, waterfront with canoes/kayaks/swimming — offered at designated times each afternoon. Open Space sessions let anyone host an activity or conversation.`
);

writeMd(
  "camp_agreements",
  `## Camp agreements

- Quiet hours 10pm–8am
- Smoke, drug, and alcohol-free
- Nut-free in public spaces
- Waterfront only with lifeguard present
- Ask consent before sharing photos/videos publicly

## Tips

Wi-Fi in Paradise Post. Snacks 24hrs in Sanctuary. Tap water is safe to drink.`
);

fs.writeFileSync(
  path.join(blocks, "camp_map.json"),
  JSON.stringify(
    {
      imageUrl: "/camp-map.svg",
      caption:
        "Camp Ki-Wa-Y site map — Paradise Post (dining hall) has Wi-Fi. Waterfront access only with lifeguard on duty.",
    },
    null,
    2
  ) + "\n"
);

const schedule = {
  days: [
    {
      id: "2026-09-26",
      label: "Fri Sep 26",
      items: [
        { time: "8:00", title: "Breakfast", category: "meal" },
        { time: "9:30", title: "Opening circle & village framing", category: "ceremony" },
        { time: "11:00", title: "Open Space — propose sessions", category: "open_space" },
        { time: "12:30", title: "Lunch", category: "meal" },
        { time: "14:00", title: "Camp activities (staff-led)", category: "free_time" },
        { time: "17:30", title: "Free time on the land", category: "free_time" },
        { time: "18:30", title: "Dinner", category: "meal" },
        { time: "20:00", title: "Evening gathering & music", category: "ceremony" },
      ],
    },
    {
      id: "2026-09-27",
      label: "Sat Sep 27",
      items: [
        { time: "8:00", title: "Breakfast", category: "meal" },
        { time: "9:30", title: "Morning Open Space sessions", category: "open_space" },
        { time: "12:30", title: "Lunch", category: "meal" },
        { time: "14:00", title: "Waterfront & camp activities", category: "free_time" },
        { time: "17:00", title: "Village check-in circle", category: "ceremony" },
        { time: "18:30", title: "Dinner", category: "meal" },
        { time: "20:30", title: "Campfire stories", category: "ceremony" },
      ],
    },
    {
      id: "2026-09-28",
      label: "Sun Sep 28",
      items: [
        { time: "8:00", title: "Breakfast", category: "meal" },
        { time: "9:30", title: "Co-creation teams meet", category: "open_space" },
        { time: "12:30", title: "Lunch", category: "meal" },
        { time: "14:00", title: "Afternoon Open Space", category: "open_space" },
        { time: "17:30", title: "Rest & wander", category: "free_time" },
        { time: "18:30", title: "Dinner", category: "meal" },
        { time: "20:00", title: "Closing reflections (informal)", category: "ceremony" },
      ],
    },
    {
      id: "2026-09-29",
      label: "Mon Sep 29",
      items: [
        { time: "8:00", title: "Breakfast", category: "meal" },
        { time: "9:30", title: "Harvest & integration circle", category: "ceremony" },
        { time: "11:00", title: "Pack-down & gratitude", category: "free_time" },
        { time: "12:30", title: "Lunch & farewell", category: "meal" },
        { time: "13:00", title: "Main gathering concludes", category: "ceremony" },
      ],
    },
  ],
};

fs.writeFileSync(
  path.join(blocks, "event_schedule.json"),
  JSON.stringify(schedule, null, 2) + "\n"
);

console.log("Content blocks seeded.");
