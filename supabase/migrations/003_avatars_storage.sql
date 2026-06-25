-- Profile photo storage (avatars bucket)
-- Max ~70 users × ~200KB compressed photos ≈ well under free tier 1GB

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  524288,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view avatars (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users upload to their own folder: {user_id}/filename
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can manage any avatar
CREATE POLICY "Admins manage all avatars"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'avatars' AND is_admin())
  WITH CHECK (bucket_id = 'avatars' AND is_admin());
