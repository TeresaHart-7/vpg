-- Bedding details, thread read tracking, content updates, realtime replication

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bedding_details TEXT;

CREATE TABLE IF NOT EXISTS thread_read_state (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, thread_id)
);

ALTER TABLE thread_read_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own thread read state"
  ON thread_read_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for live chat and notifications (ignore if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

UPDATE admin_content_blocks
SET
  content = E'## Dates & times (2026)\n\n- Gathering **Sept 25 – Sept 29, 2026**\n- Gathering begins **Sept 25 evening**\n- Full days **Sept 26–28**\n- Main gathering concludes **Sept 29 @ 1pm**\n\n## Location\n\n**Camp Ki-Wa-Y**\n3738 Hessen Strasse, St. Clements, ON N0B 2M0\n(Right outside Waterloo, Ontario — ~1 hr from Toronto Pearson)\n\nPlease reach out to the host crew before calling the camp directly.\n\n## Getting there\n\n| From | To | Option | Notes |\n|------|-----|--------|-------|\n| Toronto Union | Kitchener | GO Train | ~2 hrs |\n| Pearson | UW | GO Bus | ~2 hrs, 1 transfer |\n| Kitchener terminal | Camp | Uber/Lyft | ~35 min — split with others! |\n| Toronto / Pearson | Camp | Uber/Lyft | 1–1.5 hrs — split with others! |\n\nCarpool coordination will happen in the Coordination section below once you''re registered.\n\n## Accommodations\n\n- Bunk beds in cabins (rooms of 6–12 people) — bring your own sheets and pillow\n- Some tenting available — let us know in registration if you can tent\n- Tell us who you''d like to bunk with when you register\n\n## Food\n\nHealthy, kid-friendly meals prepared by camp staff 3× daily. Vibrant salad bar at lunch and dinner. Snacks available 24hrs in the Sanctuary.\n\nThe facility is **nut-free** in public spaces. Let us know dietary restrictions in registration.\n\n## Technology\n\nWe''re here for quality time in nature — internet and electronics are discouraged. Wi-Fi is available in the dining hall (Paradise Post). Mediocre cell service throughout the land.\n\n## What to bring\n\n- Sleeping bag or blanket + fitted sheet, pillow\n- Towel, toiletries, refillable water bottle\n- Indoor shoes, outdoor/hiking shoes or rain boots\n- Warm layers (evenings can be 10–15°C), bathing suit, sun hat\n- Ear plugs / eye mask if you''re a light sleeper\n- Optional: camp chair, games/cards, crafts to share\n\n## Camp activities (staff-led)\n\nLow ropes, rock climbing, archery, high ropes, waterfront with canoes/kayaks/swimming — offered at designated times each afternoon. Open Space sessions let anyone host an activity or conversation.',
  updated_at = NOW()
WHERE key = 'participant_guide';

UPDATE admin_content_blocks
SET
  content = E'## Registration costs\n\n- **$400 CAD** — full event\n- **$350 CAD** — children ages 5–18\n- Children under 5 are free\n- USD equivalents: **$285 USD** for adults · **$250 USD** for kids\n\nIf you need to pay less, or want to contribute more, say so below — we want you here.\n\n## How to pay (in order of preference)\n\n1. **Interac e-transfer (preferred for Canadians):** tessmhart@gmail.com\n2. **Wise:** teresah396 (USD or CAD)\n3. **PayPal CAD:** https://paypal.me/pathwaystosource\n4. **PayPal USD:** https://paypal.me/bakejam\n5. **Venmo USD:** @james-a-baker\n\n## After paying\n\nCheck **"I have sent my payment"** in your profile, or **"I will pay by Aug 31"** if you''re committing to pay soon. These checkboxes are how the host crew tracks payment status.',
  updated_at = NOW()
WHERE key = 'payment_instructions';
