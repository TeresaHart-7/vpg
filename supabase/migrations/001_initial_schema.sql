-- Village Playground — initial schema
-- Run in Supabase SQL Editor or via supabase db push

-- Enums
CREATE TYPE coming_status AS ENUM ('yes', 'no', 'maybe');
CREATE TYPE co_creation_domain AS ENUM (
  'unifying_ground',
  'bridging_pedagogy',
  'schedule_design'
);
CREATE TYPE operational_shift_type AS ENUM (
  'beautifying_spaces',
  'pre_planned_events',
  'childcare',
  'performing_music',
  'bringing_supplies',
  'getting_supplies',
  'coordinating_logistics',
  'volunteer_coordination',
  'photos_videos',
  'arts_crafts',
  'developing_tech',
  'peer_support'
);
CREATE TYPE thread_type AS ENUM ('dm', 'announcement', 'topic_chat');
CREATE TYPE notification_type AS ENUM (
  'message',
  'reply',
  'announcement',
  'system'
);

-- Profiles (1:1 with auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 500),
  is_coming coming_status,
  dates DATE[] DEFAULT ARRAY['2026-09-25','2026-09-26','2026-09-27','2026-09-28','2026-09-29']::DATE[],
  location_from TEXT,
  what_bringing_to_support TEXT,
  desires_for_gathering TEXT,
  cabin_or_tent TEXT,
  bunk_preference TEXT,
  needs_bedding BOOLEAN,
  has_extra_bedding BOOLEAN,
  dietary_restrictions TEXT,
  other_needs TEXT,
  needs_financial_assistance TEXT,
  has_extra_to_contribute TEXT,
  payment_sent_checkbox BOOLEAN DEFAULT FALSE,
  will_pay_by_aug31_checkbox BOOLEAN DEFAULT FALSE,
  visibility_overrides JSONB DEFAULT '{}'::JSONB,
  is_admin BOOLEAN DEFAULT FALSE,
  registration_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;

-- Linked guests
CREATE TABLE linked_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT CHECK (bio IS NULL OR char_length(bio) <= 500),
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by_user_id UUID REFERENCES auth.users(id),
  claim_token UUID DEFAULT gen_random_uuid(),
  prepopulated_from_parent JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_linked_guests_parent ON linked_guests(parent_profile_id);
CREATE UNIQUE INDEX idx_linked_guests_claim_token ON linked_guests(claim_token);

-- Connections (directed, strength 1-4)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  strength SMALLINT NOT NULL CHECK (strength BETWEEN 1 AND 4),
  set_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id_a, profile_id_b, set_by_user_id),
  CHECK (profile_id_a <> profile_id_b)
);

CREATE INDEX idx_connections_a ON connections(profile_id_a);
CREATE INDEX idx_connections_b ON connections(profile_id_b);

-- Co-creation interests
CREATE TABLE co_creation_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain co_creation_domain NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id, domain)
);

-- Operational shifts
CREATE TABLE operational_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shift_type operational_shift_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id, shift_type)
);

-- Threads
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type thread_type NOT NULL DEFAULT 'topic_chat',
  title TEXT NOT NULL,
  participant_ids UUID[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_thread ON messages(thread_id, created_at DESC);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  payload JSONB DEFAULT '{}'::JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- Admin content blocks (markdown)
CREATE TABLE admin_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER linked_guests_updated_at BEFORE UPDATE ON linked_guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER threads_updated_at BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper: is current user admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's profile id
CREATE OR REPLACE FUNCTION current_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_creation_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_content_blocks ENABLE ROW LEVEL SECURITY;

-- Profiles: public fields visible to authenticated; private to owner + admin
CREATE POLICY "Authenticated can read public profile fields"
  ON profiles FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Linked guests
CREATE POLICY "Authenticated can read linked guests"
  ON linked_guests FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Parent can manage linked guests"
  ON linked_guests FOR ALL TO authenticated
  USING (
    parent_profile_id = current_profile_id() OR is_admin()
  )
  WITH CHECK (
    parent_profile_id = current_profile_id() OR is_admin()
  );

-- Connections: visible to all authenticated (per project rules)
CREATE POLICY "Authenticated can read connections"
  ON connections FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Users manage own connections"
  ON connections FOR ALL TO authenticated
  USING (set_by_user_id = auth.uid() OR is_admin())
  WITH CHECK (set_by_user_id = auth.uid() OR is_admin());

-- Co-creation & operational shifts
CREATE POLICY "Authenticated read co_creation"
  ON co_creation_interests FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Users manage own co_creation"
  ON co_creation_interests FOR ALL TO authenticated
  USING (profile_id = current_profile_id() OR is_admin())
  WITH CHECK (profile_id = current_profile_id() OR is_admin());

CREATE POLICY "Authenticated read operational_shifts"
  ON operational_shifts FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Users manage own operational_shifts"
  ON operational_shifts FOR ALL TO authenticated
  USING (profile_id = current_profile_id() OR is_admin())
  WITH CHECK (profile_id = current_profile_id() OR is_admin());

-- Threads & messages (basic policies; expand in Phase 4)
CREATE POLICY "Participants read threads they're in"
  ON threads FOR SELECT TO authenticated
  USING (auth.uid() = ANY(participant_ids) OR is_admin() OR type = 'announcement');

CREATE POLICY "Authenticated read announcements"
  ON threads FOR SELECT TO authenticated
  USING (type = 'announcement');

CREATE POLICY "Admin manage threads"
  ON threads FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Read messages in accessible threads"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM threads t
      WHERE t.id = thread_id
      AND (auth.uid() = ANY(t.participant_ids) OR t.type = 'announcement' OR is_admin())
    )
  );

CREATE POLICY "Send messages in threads"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Notifications: own only
CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

-- Content blocks: read all authenticated, write admin
CREATE POLICY "Authenticated read content blocks"
  ON admin_content_blocks FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Public read landing content"
  ON admin_content_blocks FOR SELECT TO anon
  USING (key IN ('orienting_artifact', 'payment_instructions', 'participant_guide'));

CREATE POLICY "Admin write content blocks"
  ON admin_content_blocks FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Storage bucket for profile photos (run separately in dashboard or add here)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Seed content blocks
INSERT INTO admin_content_blocks (key, content) VALUES
(
  'orienting_artifact',
  E'## Purpose\n\nThe Village Playground is a gathering for people exploring **villaging** — cultivating interdependent, high-trust relationships of mutual support and thrival.\n\n## Principles\n\n- **Relationship first** — we show up for each other, not just the program\n- **Co-creation** — the gathering emerges from everyone''s gifts and questions\n- **Care for the whole** — children, elders, and newcomers are part of the village\n- **Honest presence** — we practice showing up as we are\n\n## Practices\n\n- Share meals, stories, and quiet time on the land\n- Offer what you can; ask for what you need\n- Move at the speed of trust'
),
(
  'payment_instructions',
  E'## Registration costs\n\n- **$350 CAD** — 4 days (Sept 25 evening through Sept 29)\n- **$400 CAD** — includes the optional "Now What" day (Sept 30)\n- USD equivalents: approximately **$255 USD** / **$290 USD**\n\n## How to pay\n\n**E-transfer (preferred):** Send to **tessmhart@gmail.com** — please include your name in the memo.\n\n**Other options:** Wise, PayPal, or Venmo — contact the host crew if you need details.\n\n## Flexible contribution\n\nIf the full amount is a stretch, please say so in the registration survey — we want you here. If you have extra to contribute, that helps others attend.\n\n## Checkboxes\n\nAfter paying (or committing to pay by Aug 31), check the boxes in your profile so we can track payment status.'
),
(
  'participant_guide',
  E'## Camp Ki-Wa-Y\n\nNear Waterloo, Ontario. Sept 25 evening – Sept 29/30, 2026.\n\n## Getting there\n\nCarpool coordination will happen in the Logistics Hub once registration opens.\n\n## What to bring\n\nComfortable clothes, bedding if camping, anything you''d like to share with the village.\n\n## Contact\n\nReach the host crew through the in-app announcements once you''re registered.'
)
ON CONFLICT (key) DO NOTHING;

-- NOTE: After your first login, promote yourself to admin:
-- UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
