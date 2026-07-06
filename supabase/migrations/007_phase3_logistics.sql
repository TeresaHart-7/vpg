-- Phase 3: Logistics Coordination Hub + reply notifications

CREATE TYPE logistics_category AS ENUM ('travel', 'accommodation', 'supplies');

CREATE TABLE logistics_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category logistics_category NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_submissions_category ON logistics_submissions(category, created_at DESC);
CREATE INDEX idx_logistics_submissions_profile ON logistics_submissions(profile_id);

CREATE TABLE logistics_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES logistics_submissions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_replies_submission ON logistics_replies(submission_id, created_at ASC);

CREATE TRIGGER logistics_submissions_updated_at BEFORE UPDATE ON logistics_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE logistics_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read logistics submissions"
  ON logistics_submissions FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Users manage own logistics submissions"
  ON logistics_submissions FOR INSERT TO authenticated
  WITH CHECK (profile_id = current_profile_id());

CREATE POLICY "Users update own logistics submissions"
  ON logistics_submissions FOR UPDATE TO authenticated
  USING (profile_id = current_profile_id() OR is_admin())
  WITH CHECK (profile_id = current_profile_id() OR is_admin());

CREATE POLICY "Users delete own logistics submissions"
  ON logistics_submissions FOR DELETE TO authenticated
  USING (profile_id = current_profile_id() OR is_admin());

CREATE POLICY "Authenticated read logistics replies"
  ON logistics_replies FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated post logistics replies"
  ON logistics_replies FOR INSERT TO authenticated
  WITH CHECK (profile_id = current_profile_id());

-- Notify submission owner when someone replies (not self-replies)
CREATE OR REPLACE FUNCTION notify_logistics_reply()
RETURNS TRIGGER AS $$
DECLARE
  owner_user_id UUID;
  submission_title TEXT;
  replier_user_id UUID;
BEGIN
  SELECT p.user_id, ls.title
  INTO owner_user_id, submission_title
  FROM logistics_submissions ls
  JOIN profiles p ON p.id = ls.profile_id
  WHERE ls.id = NEW.submission_id;

  SELECT user_id INTO replier_user_id FROM profiles WHERE id = NEW.profile_id;

  IF owner_user_id IS NULL OR owner_user_id = replier_user_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, type, payload)
  VALUES (
    owner_user_id,
    'reply',
    jsonb_build_object(
      'submission_id', NEW.submission_id,
      'reply_id', NEW.id,
      'title', submission_title,
      'category', (SELECT category::text FROM logistics_submissions WHERE id = NEW.submission_id)
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_logistics_reply_notify
  AFTER INSERT ON logistics_replies
  FOR EACH ROW EXECUTE FUNCTION notify_logistics_reply();
