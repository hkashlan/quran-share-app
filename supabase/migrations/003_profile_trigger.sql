-- Migration: 003_profile_trigger.sql
-- Automatically creates a profiles row when a new user signs up via auth.users
-- Requirements: 2.1

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, jazah_total, language)
  VALUES (NEW.id, 0, 'ar');
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
-- Called by Reward_Service.awardJazah to avoid read-modify-write races.
-- Requirements: 4.1, 4.4
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
