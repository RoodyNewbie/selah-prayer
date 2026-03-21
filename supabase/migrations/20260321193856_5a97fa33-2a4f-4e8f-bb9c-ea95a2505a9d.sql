
-- Add a BEFORE INSERT trigger on profiles that forcefully resets all
-- sensitive subscription/donor fields to safe defaults, regardless of
-- what the caller supplies. This closes the residual INSERT privilege-
-- escalation window even if the handle_new_user() trigger ever fails.

CREATE OR REPLACE FUNCTION public.sanitize_profile_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hard-reset every sensitive column to its default safe value.
  -- Callers may NOT self-assign donor status or any Stripe/subscription field.
  NEW.is_donor                          := false;
  NEW.subscription_status               := 'none';
  NEW.subscription_id                   := NULL;
  NEW.subscription_price_id             := NULL;
  NEW.subscription_current_period_end   := NULL;
  NEW.subscription_cancel_at_period_end := false;
  NEW.stripe_customer_id                := NULL;
  RETURN NEW;
END;
$$;

-- Fire BEFORE INSERT so the sanitised values are what actually land in the row.
-- The check_admin_donor_status trigger (also BEFORE INSERT) will run afterwards
-- and can still elevate is_donor for whitelisted admin emails.
CREATE TRIGGER sanitize_profile_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_profile_on_insert();
