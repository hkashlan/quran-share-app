-- Migration: 004_push_tokens.sql
-- Adds push_tokens table for storing Expo push notification tokens per user/device
-- Requirements: 7.6, 8.2, 9.3

CREATE TABLE push_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, token)
);

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only read their own tokens
CREATE POLICY "push_tokens_select_own"
  ON push_tokens FOR SELECT
  USING (user_id = auth.uid());

-- Users can only insert their own tokens
CREATE POLICY "push_tokens_insert_own"
  ON push_tokens FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only delete their own tokens
CREATE POLICY "push_tokens_delete_own"
  ON push_tokens FOR DELETE
  USING (user_id = auth.uid());

-- Service role can read all tokens (needed by Edge Functions for push dispatch)
CREATE POLICY "push_tokens_select_service"
  ON push_tokens FOR SELECT
  USING (auth.role() = 'service_role');
