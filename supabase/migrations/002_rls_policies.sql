-- Migration: 002_rls_policies.sql
-- Row-Level Security policies for the Khatmah App
-- Requirements: 10.3

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE khatmahs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE khatmah_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE khatmah_instances  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles
-- ============================================================

-- Anyone can read any profile (needed for displaying participant names)
CREATE POLICY "profiles_select_any"
  ON profiles FOR SELECT
  USING (true);

-- Users can only insert their own profile row
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can only update their own profile row
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- khatmahs
-- ============================================================

-- Participants (and creators) can read Khatmahs they belong to
CREATE POLICY "khatmahs_select_participant"
  ON khatmahs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM khatmah_participants
      WHERE khatmah_participants.khatmah_id = khatmahs.id
        AND khatmah_participants.user_id = auth.uid()
    )
  );

-- Any authenticated user can create a Khatmah
CREATE POLICY "khatmahs_insert_authenticated"
  ON khatmahs FOR INSERT
  WITH CHECK (creator_id = auth.uid());

-- Only the Creator can update Khatmah config
CREATE POLICY "khatmahs_update_creator"
  ON khatmahs FOR UPDATE
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- ============================================================
-- khatmah_participants
-- ============================================================

-- Participants can read the participant list for Khatmahs they belong to
CREATE POLICY "khatmah_participants_select_member"
  ON khatmah_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM khatmah_participants kp
      WHERE kp.khatmah_id = khatmah_participants.khatmah_id
        AND kp.user_id = auth.uid()
    )
  );

-- Authenticated users can insert themselves as a participant (join flow)
CREATE POLICY "khatmah_participants_insert_self"
  ON khatmah_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only the Creator can remove participants
CREATE POLICY "khatmah_participants_delete_creator"
  ON khatmah_participants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM khatmahs
      WHERE khatmahs.id = khatmah_participants.khatmah_id
        AND khatmahs.creator_id = auth.uid()
    )
  );

-- ============================================================
-- khatmah_instances
-- ============================================================

-- Participants can read instances for Khatmahs they belong to
CREATE POLICY "khatmah_instances_select_participant"
  ON khatmah_instances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM khatmah_participants
      WHERE khatmah_participants.khatmah_id = khatmah_instances.khatmah_id
        AND khatmah_participants.user_id = auth.uid()
    )
  );

-- Only the Creator can insert new instances (cycle resets)
CREATE POLICY "khatmah_instances_insert_creator"
  ON khatmah_instances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM khatmahs
      WHERE khatmahs.id = khatmah_instances.khatmah_id
        AND khatmahs.creator_id = auth.uid()
    )
  );

-- Participants can update instances for Khatmahs they belong to
-- (needed for progress updates, help_requested flags, completion status)
CREATE POLICY "khatmah_instances_update_participant"
  ON khatmah_instances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM khatmah_participants
      WHERE khatmah_participants.khatmah_id = khatmah_instances.khatmah_id
        AND khatmah_participants.user_id = auth.uid()
    )
  );
