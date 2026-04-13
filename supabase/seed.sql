-- seed.sql — Sample data for local Khatmah App development
-- Creates 3 auth users, their profiles, one Khatmah, participants, and an active instance.
-- Run after migrations: npx supabase db reset (which applies migrations then this seed)

-- ============================================================
-- Auth users (bypasses email confirmation for local dev)
-- ============================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'creator@example.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'participant1@example.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'participant2@example.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated', 'authenticated'
  );

-- ============================================================
-- Profiles
-- ============================================================
INSERT INTO profiles (id, display_name, language, jazah_total)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'أحمد المنصور',  'ar', 5),
  ('00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء', 'ar', 3),
  ('00000000-0000-0000-0000-000000000003', 'محمد العمري',   'ar', 2);

-- ============================================================
-- Khatmah
-- ============================================================
INSERT INTO khatmahs (id, name, creator_id, lifecycle_type, reset_calendar, auto_renewal, assignment_mode, jazah_multiplier, invitation_uuid, status)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'ختمة رمضان المبارك',
  '00000000-0000-0000-0000-000000000001',
  'recurring',
  'islamic',
  true,
  'automatic',
  2,
  'bbbbbbbb-0000-0000-0000-000000000001',
  'active'
);

-- ============================================================
-- Participants
-- ============================================================
INSERT INTO khatmah_participants (khatmah_id, user_id)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003');

-- ============================================================
-- Active Khatmah instance (Cycle 1)
-- 30 Juz' distributed round-robin across 3 participants:
--   User 1 (أحمد):   Juz' 1,4,7,10,13,16,19,22,25,28
--   User 2 (فاطمة):  Juz' 2,5,8,11,14,17,20,23,26,29
--   User 3 (محمد):   Juz' 3,6,9,12,15,18,21,24,27,30
-- Juz' 1 is completed by User 1; Juz' 2 has help_requested by User 2.
-- ============================================================
INSERT INTO khatmah_instances (
  id, khatmah_id, cycle_number, status,

  -- Juz' 1 — completed by User 1
  juz_1_user_id, juz_1_user_full_name, juz_1_completed, juz_1_current_page,
  -- Juz' 2 — help requested by User 2
  juz_2_user_id, juz_2_user_full_name, juz_2_help_requested, juz_2_current_page,
  -- Juz' 3 — in progress by User 3
  juz_3_user_id, juz_3_user_full_name, juz_3_current_page,
  -- Juz' 4–30 — assigned, not started
  juz_4_user_id,  juz_4_user_full_name,
  juz_5_user_id,  juz_5_user_full_name,
  juz_6_user_id,  juz_6_user_full_name,
  juz_7_user_id,  juz_7_user_full_name,
  juz_8_user_id,  juz_8_user_full_name,
  juz_9_user_id,  juz_9_user_full_name,
  juz_10_user_id, juz_10_user_full_name,
  juz_11_user_id, juz_11_user_full_name,
  juz_12_user_id, juz_12_user_full_name,
  juz_13_user_id, juz_13_user_full_name,
  juz_14_user_id, juz_14_user_full_name,
  juz_15_user_id, juz_15_user_full_name,
  juz_16_user_id, juz_16_user_full_name,
  juz_17_user_id, juz_17_user_full_name,
  juz_18_user_id, juz_18_user_full_name,
  juz_19_user_id, juz_19_user_full_name,
  juz_20_user_id, juz_20_user_full_name,
  juz_21_user_id, juz_21_user_full_name,
  juz_22_user_id, juz_22_user_full_name,
  juz_23_user_id, juz_23_user_full_name,
  juz_24_user_id, juz_24_user_full_name,
  juz_25_user_id, juz_25_user_full_name,
  juz_26_user_id, juz_26_user_full_name,
  juz_27_user_id, juz_27_user_full_name,
  juz_28_user_id, juz_28_user_full_name,
  juz_29_user_id, juz_29_user_full_name,
  juz_30_user_id, juz_30_user_full_name
)
VALUES (
  'cccccccc-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  1,
  'active',

  -- Juz' 1
  '00000000-0000-0000-0000-000000000001', 'أحمد المنصور',  true,  21,
  -- Juz' 2
  '00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء', true,  30,
  -- Juz' 3
  '00000000-0000-0000-0000-000000000003', 'محمد العمري',   15,
  -- Juz' 4
  '00000000-0000-0000-0000-000000000001', 'أحمد المنصور',
  -- Juz' 5
  '00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء',
  -- Juz' 6
  '00000000-0000-0000-0000-000000000003', 'محمد العمري',
  -- Juz' 7
  '00000000-0000-0000-0000-000000000001', 'أحمد المنصور',
  -- Juz' 8
  '00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء',
  -- Juz' 9
  '00000000-0000-0000-0000-000000000003', 'محمد العمري',
  -- Juz' 10
  '00000000-0000-0000-0000-000000000001', 'أحمد المنصور',
  -- Juz' 11
  '00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء',
  -- Juz' 12
  '00000000-0000-0000-0000-000000000003', 'محمد العمري',
  -- Juz' 13
  '00000000-0000-0000-0000-000000000001', 'أحمد المنصور',
  -- Juz' 14
  '00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء',
  -- Juz' 15
  '00000000-0000-0000-0000-000000000003', 'محمد العمري',
  -- Juz' 16
  '00000000-0000-0000-0000-000000000001', 'أحمد المنصور',
  -- Juz' 17
  '00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء',
  -- Juz' 18
  '00000000-0000-0000-0000-000000000003', 'محمد العمري',
  -- Juz' 19
  '00000000-0000-0000-0000-000000000001', 'أحمد المنصور',
  -- Juz' 20
  '00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء',
  -- Juz' 21
  '00000000-0000-0000-0000-000000000003', 'محمد العمري',
  -- Juz' 22
  '00000000-0000-0000-0000-000000000001', 'أحمد المنصور',
  -- Juz' 23
  '00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء',
  -- Juz' 24
  '00000000-0000-0000-0000-000000000003', 'محمد العمري',
  -- Juz' 25
  '00000000-0000-0000-0000-000000000001', 'أحمد المنصور',
  -- Juz' 26
  '00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء',
  -- Juz' 27
  '00000000-0000-0000-0000-000000000003', 'محمد العمري',
  -- Juz' 28
  '00000000-0000-0000-0000-000000000001', 'أحمد المنصور',
  -- Juz' 29
  '00000000-0000-0000-0000-000000000002', 'فاطمة الزهراء',
  -- Juz' 30
  '00000000-0000-0000-0000-000000000003', 'محمد العمري'
);
