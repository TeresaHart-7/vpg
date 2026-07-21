-- Recordings & reflections feed: audio/link shares with timestamped comments

CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'link')),
  storage_path TEXT,
  external_url TEXT,
  transcript TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT recordings_source_upload_has_path CHECK (
    source_type <> 'upload' OR storage_path IS NOT NULL
  ),
  CONSTRAINT recordings_source_link_has_url CHECK (
    source_type <> 'link' OR external_url IS NOT NULL
  )
);

CREATE INDEX idx_recordings_created ON recordings(created_at DESC);
CREATE INDEX idx_recordings_profile ON recordings(profile_id);
CREATE INDEX idx_recordings_tags ON recordings USING GIN (tags);

CREATE TABLE recording_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  timestamp_seconds NUMERIC,
  timestamp_label TEXT,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recording_comments_recording
  ON recording_comments(recording_id, created_at ASC);
CREATE INDEX idx_recording_comments_timestamp
  ON recording_comments(recording_id, timestamp_seconds ASC NULLS LAST);

CREATE TRIGGER recordings_updated_at BEFORE UPDATE ON recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER recording_comments_updated_at BEFORE UPDATE ON recording_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recording_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read recordings"
  ON recordings FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Users insert own recordings"
  ON recordings FOR INSERT TO authenticated
  WITH CHECK (profile_id = current_profile_id());

CREATE POLICY "Users update own recordings"
  ON recordings FOR UPDATE TO authenticated
  USING (profile_id = current_profile_id() OR is_admin())
  WITH CHECK (profile_id = current_profile_id() OR is_admin());

CREATE POLICY "Users delete own recordings"
  ON recordings FOR DELETE TO authenticated
  USING (profile_id = current_profile_id() OR is_admin());

-- Visible comments: not hidden, or own comment, or admin
CREATE POLICY "Authenticated read recording comments"
  ON recording_comments FOR SELECT TO authenticated
  USING (
    NOT is_hidden
    OR profile_id = current_profile_id()
    OR is_admin()
  );

CREATE POLICY "Users insert own recording comments"
  ON recording_comments FOR INSERT TO authenticated
  WITH CHECK (profile_id = current_profile_id());

CREATE POLICY "Users update own recording comments"
  ON recording_comments FOR UPDATE TO authenticated
  USING (profile_id = current_profile_id() OR is_admin())
  WITH CHECK (profile_id = current_profile_id() OR is_admin());

CREATE POLICY "Users delete own recording comments"
  ON recording_comments FOR DELETE TO authenticated
  USING (profile_id = current_profile_id() OR is_admin());

-- Storage bucket for compressed audio uploads (~30MB cap)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  true,
  31457280,
  ARRAY['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Recording audio is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recordings');

CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own recordings storage"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own recordings storage"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins manage all recording files"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'recordings' AND is_admin())
  WITH CHECK (bucket_id = 'recordings' AND is_admin());
