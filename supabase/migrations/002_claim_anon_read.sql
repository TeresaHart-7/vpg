-- Allow unauthenticated users to view linked guest info for claim flow
CREATE POLICY "Anon can read linked guests for claim"
  ON linked_guests FOR SELECT TO anon
  USING (true);
