-- Message edit/delete timestamps + author policies for threads and messages

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE POLICY "Authors edit own messages"
  ON messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid() OR is_admin())
  WITH CHECK (sender_id = auth.uid() OR is_admin());

CREATE POLICY "Authors update own topic threads"
  ON threads FOR UPDATE TO authenticated
  USING (created_by = auth.uid() AND type = 'topic_chat')
  WITH CHECK (created_by = auth.uid() AND type = 'topic_chat');

CREATE POLICY "Authors delete own threads"
  ON threads FOR DELETE TO authenticated
  USING (
    (created_by = auth.uid() AND type IN ('topic_chat', 'dm'))
    OR is_admin()
  );
