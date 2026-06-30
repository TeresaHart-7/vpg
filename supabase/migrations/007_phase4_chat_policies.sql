-- Phase 4: Chat/announcement policies + notification triggers

DROP POLICY IF EXISTS "Send messages in threads" ON messages;

CREATE POLICY "Send messages in accessible threads"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM threads t
      WHERE t.id = thread_id
      AND (
        t.type = 'topic_chat'
        OR (t.type = 'announcement' AND is_admin())
        OR (t.type = 'dm' AND auth.uid() = ANY(t.participant_ids))
        OR is_admin()
      )
    )
  );

CREATE POLICY "Participants create topic threads"
  ON threads FOR INSERT TO authenticated
  WITH CHECK (
    type = 'topic_chat'
    AND created_by = auth.uid()
    AND auth.uid() = ANY(participant_ids)
  );

CREATE POLICY "Participants create DMs"
  ON threads FOR INSERT TO authenticated
  WITH CHECK (
    type = 'dm'
    AND created_by = auth.uid()
    AND auth.uid() = ANY(participant_ids)
    AND cardinality(participant_ids) = 2
  );

CREATE POLICY "Authenticated read topic chats"
  ON threads FOR SELECT TO authenticated
  USING (type = 'topic_chat');

-- Notify all participants when admin posts an announcement
CREATE OR REPLACE FUNCTION notify_announcement_message()
RETURNS TRIGGER AS $$
DECLARE
  thread_type_val thread_type;
BEGIN
  SELECT type INTO thread_type_val FROM threads WHERE id = NEW.thread_id;

  IF thread_type_val IS DISTINCT FROM 'announcement' THEN
    RETURN NEW;
  END IF;

  INSERT INTO notifications (user_id, type, payload)
  SELECT
    p.user_id,
    'announcement',
    jsonb_build_object(
      'thread_id', NEW.thread_id,
      'message_id', NEW.id,
      'preview', left(NEW.body, 160)
    )
  FROM profiles p
  WHERE p.user_id IS NOT NULL
    AND p.user_id <> NEW.sender_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_announcement_message_notify ON messages;
CREATE TRIGGER on_announcement_message_notify
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_announcement_message();

-- Notify DM participants on new messages
CREATE OR REPLACE FUNCTION notify_thread_message()
RETURNS TRIGGER AS $$
DECLARE
  thread_row threads%ROWTYPE;
  participant UUID;
BEGIN
  SELECT * INTO thread_row FROM threads WHERE id = NEW.thread_id;

  IF thread_row.type NOT IN ('dm', 'topic_chat') THEN
    RETURN NEW;
  END IF;

  IF thread_row.type = 'dm' THEN
    FOREACH participant IN ARRAY thread_row.participant_ids LOOP
      IF participant IS NOT NULL AND participant <> NEW.sender_id THEN
        INSERT INTO notifications (user_id, type, payload)
        VALUES (
          participant,
          'message',
          jsonb_build_object(
            'thread_id', NEW.thread_id,
            'message_id', NEW.id,
            'thread_title', thread_row.title,
            'preview', left(NEW.body, 160)
          )
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_thread_message_notify ON messages;
CREATE TRIGGER on_thread_message_notify
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_thread_message();
