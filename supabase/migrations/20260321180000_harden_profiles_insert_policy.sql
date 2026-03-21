-- Harden profiles INSERT policy to prevent users from setting is_donor,
-- subscription_status, or any Stripe fields when inserting their own profile.
--
-- The handle_new_user() trigger normally creates the profile row on signup,
-- but if it fails, a user could manually INSERT with is_donor = true.
-- This policy forces all sensitive fields to safe defaults on INSERT.
--
-- The check_admin_donor_status BEFORE INSERT trigger runs as SECURITY DEFINER
-- and can still override is_donor = true for admin emails, because trigger
-- execution happens after the policy WITH CHECK passes on the raw input but
-- before the final row is written — the trigger modifies NEW.is_donor in-place.
--
-- NOTE: We explicitly check is_donor = false (not IS NULL) because the column
-- is NOT NULL DEFAULT false, so the value will always be false for honest inserts.

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile safely"
ON public.profiles FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND is_donor = false
  AND subscription_status IS NULL
  AND stripe_customer_id IS NULL
  AND subscription_id IS NULL
  AND subscription_price_id IS NULL
  AND subscription_current_period_end IS NULL
  AND subscription_cancel_at_period_end IS NULL
);
