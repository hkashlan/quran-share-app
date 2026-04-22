-- Consolidated Migration: 001_consolidated_schema.sql
-- Creates the complete initial schema for the Khatmah App
-- Combines: initial_schema, rls_policies, profile_trigger, push_tokens

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  language      TEXT NOT NULL DEFAULT 'ar',
  jazah_total   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- khatmahs
-- ============================================================
CREATE TABLE khatmahs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  creator_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lifecycle_type   TEXT NOT NULL CHECK (lifecycle_type IN ('one_time', 'recurring')),
  reset_calendar   TEXT CHECK (reset_calendar IN ('gregorian', 'islamic')),
  auto_renewal     BOOLEAN NOT NULL DEFAULT false,
  assignment_mode  TEXT NOT NULL CHECK (assignment_mode IN ('manual', 'automatic')),
  jazah_multiplier INTEGER NOT NULL DEFAULT 1,
  invitation_uuid  UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- khatmah_participants
-- ============================================================
CREATE TABLE khatmah_participants (
  khatmah_id UUID NOT NULL REFERENCES khatmahs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (khatmah_id, user_id)
);

-- ============================================================
-- khatmah_instances (one row per Cycle)
-- All 30 Juz' columns expanded explicitly.
-- Column groups per Juz' N (1–30):
--   juz_N_user_id            UUID  — primary assignee
--   juz_N_user_full_name     TEXT  — frozen at assignment time
--   juz_N_completed          BOOLEAN NOT NULL DEFAULT false
--   juz_N_planb_user_id      UUID  — plan-b adopter
--   juz_N_planb_user_full_name TEXT — frozen at adoption time
--   juz_N_help_requested     BOOLEAN NOT NULL DEFAULT false
--   juz_N_current_page       INTEGER NOT NULL DEFAULT 0
-- ============================================================
CREATE TABLE khatmah_instances (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  khatmah_id   UUID NOT NULL REFERENCES khatmahs(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL DEFAULT 1,
  started_at   TIMESTAMPTZ DEFAULT now(),
  ended_at     TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),

  -- Juz' 1
  juz_1_user_id              UUID REFERENCES profiles(id),
  juz_1_user_full_name       TEXT,
  juz_1_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_1_planb_user_id        UUID REFERENCES profiles(id),
  juz_1_planb_user_full_name TEXT,
  juz_1_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_1_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 2
  juz_2_user_id              UUID REFERENCES profiles(id),
  juz_2_user_full_name       TEXT,
  juz_2_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_2_planb_user_id        UUID REFERENCES profiles(id),
  juz_2_planb_user_full_name TEXT,
  juz_2_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_2_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 3
  juz_3_user_id              UUID REFERENCES profiles(id),
  juz_3_user_full_name       TEXT,
  juz_3_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_3_planb_user_id        UUID REFERENCES profiles(id),
  juz_3_planb_user_full_name TEXT,
  juz_3_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_3_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 4
  juz_4_user_id              UUID REFERENCES profiles(id),
  juz_4_user_full_name       TEXT,
  juz_4_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_4_planb_user_id        UUID REFERENCES profiles(id),
  juz_4_planb_user_full_name TEXT,
  juz_4_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_4_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 5
  juz_5_user_id              UUID REFERENCES profiles(id),
  juz_5_user_full_name       TEXT,
  juz_5_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_5_planb_user_id        UUID REFERENCES profiles(id),
  juz_5_planb_user_full_name TEXT,
  juz_5_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_5_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 6
  juz_6_user_id              UUID REFERENCES profiles(id),
  juz_6_user_full_name       TEXT,
  juz_6_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_6_planb_user_id        UUID REFERENCES profiles(id),
  juz_6_planb_user_full_name TEXT,
  juz_6_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_6_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 7
  juz_7_user_id              UUID REFERENCES profiles(id),
  juz_7_user_full_name       TEXT,
  juz_7_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_7_planb_user_id        UUID REFERENCES profiles(id),
  juz_7_planb_user_full_name TEXT,
  juz_7_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_7_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 8
  juz_8_user_id              UUID REFERENCES profiles(id),
  juz_8_user_full_name       TEXT,
  juz_8_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_8_planb_user_id        UUID REFERENCES profiles(id),
  juz_8_planb_user_full_name TEXT,
  juz_8_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_8_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 9
  juz_9_user_id              UUID REFERENCES profiles(id),
  juz_9_user_full_name       TEXT,
  juz_9_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_9_planb_user_id        UUID REFERENCES profiles(id),
  juz_9_planb_user_full_name TEXT,
  juz_9_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_9_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 10
  juz_10_user_id              UUID REFERENCES profiles(id),
  juz_10_user_full_name       TEXT,
  juz_10_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_10_planb_user_id        UUID REFERENCES profiles(id),
  juz_10_planb_user_full_name TEXT,
  juz_10_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_10_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 11
  juz_11_user_id              UUID REFERENCES profiles(id),
  juz_11_user_full_name       TEXT,
  juz_11_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_11_planb_user_id        UUID REFERENCES profiles(id),
  juz_11_planb_user_full_name TEXT,
  juz_11_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_11_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 12
  juz_12_user_id              UUID REFERENCES profiles(id),
  juz_12_user_full_name       TEXT,
  juz_12_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_12_planb_user_id        UUID REFERENCES profiles(id),
  juz_12_planb_user_full_name TEXT,
  juz_12_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_12_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 13
  juz_13_user_id              UUID REFERENCES profiles(id),
  juz_13_user_full_name       TEXT,
  juz_13_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_13_planb_user_id        UUID REFERENCES profiles(id),
  juz_13_planb_user_full_name TEXT,
  juz_13_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_13_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 14
  juz_14_user_id              UUID REFERENCES profiles(id),
  juz_14_user_full_name       TEXT,
  juz_14_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_14_planb_user_id        UUID REFERENCES profiles(id),
  juz_14_planb_user_full_name TEXT,
  juz_14_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_14_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 15
  juz_15_user_id              UUID REFERENCES profiles(id),
  juz_15_user_full_name       TEXT,
  juz_15_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_15_planb_user_id        UUID REFERENCES profiles(id),
  juz_15_planb_user_full_name TEXT,
  juz_15_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_15_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 16
  juz_16_user_id              UUID REFERENCES profiles(id),
  juz_16_user_full_name       TEXT,
  juz_16_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_16_planb_user_id        UUID REFERENCES profiles(id),
  juz_16_planb_user_full_name TEXT,
  juz_16_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_16_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 17
  juz_17_user_id              UUID REFERENCES profiles(id),
  juz_17_user_full_name       TEXT,
  juz_17_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_17_planb_user_id        UUID REFERENCES profiles(id),
  juz_17_planb_user_full_name TEXT,
  juz_17_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_17_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 18
  juz_18_user_id              UUID REFERENCES profiles(id),
  juz_18_user_full_name       TEXT,
  juz_18_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_18_planb_user_id        UUID REFERENCES profiles(id),
  juz_18_planb_user_full_name TEXT,
  juz_18_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_18_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 19
  juz_19_user_id              UUID REFERENCES profiles(id),
  juz_19_user_full_name       TEXT,
  juz_19_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_19_planb_user_id        UUID REFERENCES profiles(id),
  juz_19_planb_user_full_name TEXT,
  juz_19_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_19_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 20
  juz_20_user_id              UUID REFERENCES profiles(id),
  juz_20_user_full_name       TEXT,
  juz_20_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_20_planb_user_id        UUID REFERENCES profiles(id),
  juz_20_planb_user_full_name TEXT,
  juz_20_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_20_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 21
  juz_21_user_id              UUID REFERENCES profiles(id),
  juz_21_user_full_name       TEXT,
  juz_21_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_21_planb_user_id        UUID REFERENCES profiles(id),
  juz_21_planb_user_full_name TEXT,
  juz_21_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_21_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 22
  juz_22_user_id              UUID REFERENCES profiles(id),
  juz_22_user_full_name       TEXT,
  juz_22_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_22_planb_user_id        UUID REFERENCES profiles(id),
  juz_22_planb_user_full_name TEXT,
  juz_22_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_22_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 23
  juz_23_user_id              UUID REFERENCES profiles(id),
  juz_23_user_full_name       TEXT,
  juz_23_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_23_planb_user_id        UUID REFERENCES profiles(id),
  juz_23_planb_user_full_name TEXT,
  juz_23_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_23_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 24
  juz_24_user_id              UUID REFERENCES profiles(id),
  juz_24_user_full_name       TEXT,
  juz_24_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_24_planb_user_id        UUID REFERENCES profiles(id),
  juz_24_planb_user_full_name TEXT,
  juz_24_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_24_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 25
  juz_25_user_id              UUID REFERENCES profiles(id),
  juz_25_user_full_name       TEXT,
  juz_25_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_25_planb_user_id        UUID REFERENCES profiles(id),
  juz_25_planb_user_full_name TEXT,
  juz_25_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_25_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 26
  juz_26_user_id              UUID REFERENCES profiles(id),
  juz_26_user_full_name       TEXT,
  juz_26_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_26_planb_user_id        UUID REFERENCES profiles(id),
  juz_26_planb_user_full_name TEXT,
  juz_26_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_26_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 27
  juz_27_user_id              UUID REFERENCES profiles(id),
  juz_27_user_full_name       TEXT,
  juz_27_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_27_planb_user_id        UUID REFERENCES profiles(id),
  juz_27_planb_user_full_name TEXT,
  juz_27_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_27_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 28
  juz_28_user_id              UUID REFERENCES profiles(id),
  juz_28_user_full_name       TEXT,
  juz_28_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_28_planb_user_id        UUID REFERENCES profiles(id),
  juz_28_planb_user_full_name TEXT,
  juz_28_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_28_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 29
  juz_29_user_id              UUID REFERENCES profiles(id),
  juz_29_user_full_name       TEXT,
  juz_29_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_29_planb_user_id        UUID REFERENCES profiles(id),
  juz_29_planb_user_full_name TEXT,
  juz_29_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_29_current_page         INTEGER NOT NULL DEFAULT 0,

  -- Juz' 30
  juz_30_user_id              UUID REFERENCES profiles(id),
  juz_30_user_full_name       TEXT,
  juz_30_completed            BOOLEAN NOT NULL DEFAULT false,
  juz_30_planb_user_id        UUID REFERENCES profiles(id),
  juz_30_planb_user_full_name TEXT,
  juz_30_help_requested       BOOLEAN NOT NULL DEFAULT false,
  juz_30_current_page         INTEGER NOT NULL DEFAULT 0,

  UNIQUE (khatmah_id, cycle_number)
);

-- ============================================================
-- push_tokens
-- ============================================================
CREATE TABLE push_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, token)
);

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE khatmahs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE khatmah_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE khatmah_instances  ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles RLS policies
-- ============================================================
CREATE POLICY "profiles_select_any"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

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
-- ============================================================
-- khatmahs RLS policies
-- ============================================================
CREATE POLICY "khatmahs_select_participant"
  ON khatmahs FOR SELECT
  USING (
    creator_id = auth.uid()
    OR is_khatmah_member(id)
  );

CREATE POLICY "khatmahs_select_by_invite"
  ON khatmahs FOR SELECT
  USING (true);

CREATE POLICY "khatmahs_insert_authenticated"
  ON khatmahs FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "khatmahs_update_creator"
  ON khatmahs FOR UPDATE
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- ============================================================
-- khatmah_participants RLS policies
-- ============================================================


CREATE POLICY "khatmah_participants_insert_self"
  ON khatmah_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

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
-- khatmah_instances RLS policies
-- ============================================================
CREATE POLICY "khatmah_instances_select_participant"
  ON khatmah_instances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM khatmah_participants
      WHERE khatmah_participants.khatmah_id = khatmah_instances.khatmah_id
        AND khatmah_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "khatmah_instances_insert_creator"
  ON khatmah_instances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM khatmahs
      WHERE khatmahs.id = khatmah_instances.khatmah_id
        AND khatmahs.creator_id = auth.uid()
    )
  );

CREATE POLICY "khatmah_instances_update_participant"
  ON khatmah_instances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM khatmah_participants
      WHERE khatmah_participants.khatmah_id = khatmah_instances.khatmah_id
        AND khatmah_participants.user_id = auth.uid()
    )
  );

-- ============================================================
-- push_tokens RLS policies
-- ============================================================
CREATE POLICY "push_tokens_select_own"
  ON push_tokens FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "push_tokens_insert_own"
  ON push_tokens FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_tokens_delete_own"
  ON push_tokens FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "push_tokens_select_service"
  ON push_tokens FOR SELECT
  USING (auth.role() = 'service_role');

-- ============================================================
-- Triggers and Functions
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, jazah_total, language)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.email
    ),
    0,
    'ar'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- increment_jazah RPC function
-- Atomically increments profiles.jazah_total by p_amount for a given user.
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_jazah(
  p_user_id UUID,
  p_amount  INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET jazah_total = jazah_total + p_amount
  WHERE id = p_user_id;
END;
$$;
