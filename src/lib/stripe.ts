// Stripe configuration - keys loaded from environment variables
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51SrTgLBAwfR8W0DxuVL0FY9z4tTnDway3e5kT1tYMFfxgiJZ16IyfEEu7pJDz4HcQjm3IfEbZOk93rTW3pJIyaJK00Cv49oeJl';

export const STRIPE_PRICES = {
  monthly: {
    id: 'price_1TC8v2BAwfR8W0DxStp8uNy8',
    amount: 5,
    interval: 'month' as const,
    label: '$5/month',
  },
  yearly: {
    id: 'price_1TC8v1BAwfR8W0Dxskg5vUDZ',
    amount: 40,
    interval: 'year' as const,
    label: '$40/year',
    savings: 'Save 33%',
  },
} as const;

// Admin check is handled server-side only (in edge functions and database triggers).
// Do NOT put admin emails in client-side code.

// Grace period duration in milliseconds (3 days)
export const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

// Check if a user is within the grace period
export function isWithinGracePeriod(periodEnd: string | null): boolean {
  if (!periodEnd) return false;
  const gracePeriodEnd = new Date(periodEnd).getTime() + GRACE_PERIOD_MS;
  return Date.now() < gracePeriodEnd;
}

// Check if a user has active donor status based on subscription.
// Admin bypass is handled server-side via the check_admin_donor_status database trigger.
export function hasActiveDonorStatus(
  isDonor: boolean,
  subscriptionStatus: string | null,
  periodEnd: string | null,
): boolean {
  // Not marked as donor (admins are marked as donor by the database trigger)
  if (!isDonor) {
    return false;
  }

  // Active subscription statuses
  if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
    return true;
  }

  // Grace period check
  if (subscriptionStatus === 'grace_period' && isWithinGracePeriod(periodEnd)) {
    return true;
  }

  return false;
}
