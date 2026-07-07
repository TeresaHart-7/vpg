-- Camp sessions: open-space proposals with votes and replies

CREATE TABLE camp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_camp_sessions_created ON camp_sessions(created_at DESC);
CREATE INDEX idx_camp_sessions_profile ON camp_sessions(profile_id);

CREATE TABLE camp_session_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES camp_sessions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, profile_id)
);

CREATE INDEX idx_camp_session_votes_session ON camp_session_votes(session_id);

CREATE TABLE camp_session_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES camp_sessions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_camp_session_replies_session ON camp_session_replies(session_id, created_at ASC);

CREATE TRIGGER camp_sessions_updated_at BEFORE UPDATE ON camp_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE camp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_session_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_session_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read camp sessions"
  ON camp_sessions FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Users manage own camp sessions"
  ON camp_sessions FOR INSERT TO authenticated
  WITH CHECK (profile_id = current_profile_id());

CREATE POLICY "Users update own camp sessions"
  ON camp_sessions FOR UPDATE TO authenticated
  USING (profile_id = current_profile_id() OR is_admin())
  WITH CHECK (profile_id = current_profile_id() OR is_admin());

CREATE POLICY "Users delete own camp sessions"
  ON camp_sessions FOR DELETE TO authenticated
  USING (profile_id = current_profile_id() OR is_admin());

CREATE POLICY "Authenticated read camp session votes"
  ON camp_session_votes FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Users manage own camp session votes"
  ON camp_session_votes FOR INSERT TO authenticated
  WITH CHECK (profile_id = current_profile_id());

CREATE POLICY "Users remove own camp session votes"
  ON camp_session_votes FOR DELETE TO authenticated
  USING (profile_id = current_profile_id());

CREATE POLICY "Authenticated read camp session replies"
  ON camp_session_replies FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated post camp session replies"
  ON camp_session_replies FOR INSERT TO authenticated
  WITH CHECK (profile_id = current_profile_id());

-- Notify session owner when someone replies (not self-replies)
CREATE OR REPLACE FUNCTION notify_camp_session_reply()
RETURNS TRIGGER AS $$
DECLARE
  owner_user_id UUID;
  session_title TEXT;
  replier_user_id UUID;
BEGIN
  SELECT p.user_id, cs.title
  INTO owner_user_id, session_title
  FROM camp_sessions cs
  JOIN profiles p ON p.id = cs.profile_id
  WHERE cs.id = NEW.session_id;

  SELECT user_id INTO replier_user_id FROM profiles WHERE id = NEW.profile_id;

  IF owner_user_id IS NULL OR owner_user_id = replier_user_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, type, payload)
  VALUES (
    owner_user_id,
    'reply',
    jsonb_build_object(
      'session_id', NEW.session_id,
      'reply_id', NEW.id,
      'title', session_title,
      'source', 'session'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_camp_session_reply_notify
  AFTER INSERT ON camp_session_replies
  FOR EACH ROW EXECUTE FUNCTION notify_camp_session_reply();
