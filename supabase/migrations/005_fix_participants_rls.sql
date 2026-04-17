-- Migration: 005_fix_participants_rls.sql
-- Fix infinite recursion in khatmah_participants SELECT policy.
-- The original policy queried khatmah_participants from within itself.
-- Replace with a direct user_id check to break the cycle.

DROP POLICY IF EXISTS "khatmah_participants_select_member" ON khatmah_participants;

-- A user can see all participant rows for any khatmah they are a member of.
-- We avoid self-reference by checking khatmahs.creator_id OR the user's own row directly.
-- The trick: use a SECURITY DEFINER function to bypass RLS when checking membership.

CREATE OR REPLACE FUNCTION is_khatmah_member(p_khatmah_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM khatmah_participants
    WHERE khatmah_id = p_khatmah_id
      AND user_id = auth.uid()
  );
$$;

CREATE POLICY "khatmah_participants_select_member"
  ON khatmah_participants FOR SELECT
  USING (is_khatmah_member(khatmah_id));
