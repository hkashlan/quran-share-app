-- Migration: 006_fix_khatmahs_select_rls.sql
-- Fix khatmahs SELECT policy to also allow the creator to see their own khatmah.
-- Previously, the policy only checked khatmah_participants, which doesn't exist
-- yet at the moment the creator inserts the khatmah row (before the participant
-- insert happens), causing the .select().single() after insert to fail.

DROP POLICY IF EXISTS "khatmahs_select_participant" ON khatmahs;

CREATE POLICY "khatmahs_select_participant"
  ON khatmahs FOR SELECT
  USING (
    creator_id = auth.uid()
    OR is_khatmah_member(id)
  );
