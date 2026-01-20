// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SrTgcB4wZgpJYym6Z2fqfvlXkBFACMOu4tNbzs440Bf9q5wstWvGnKn7LZUinqsqx4ljZSBqr6V7XnHidmbbp2A00jWsPU7jN';

export const STRIPE_PRICES = {
  monthly: {
    id: 'price_1SrktXB4wZgpJYymA82rzwhh',
    amount: 5,
    interval: 'month' as const,
    label: '$5/month',
  },
  yearly: {
    id: 'price_1SrktXB4wZgpJYymIlcvwlWQ',
    amount: 40,
    interval: 'year' as const,
    label: '$40/year',
    savings: 'Save 33%',
  },
} as const;

// Admin emails that always have donor access
export const ADMIN_EMAILS = [
  'dane.vicars@gmail.com',
  'selah.prayer.app@gmail.com',
  'brielhill412@gmail.com',
];

// Grace period duration in milliseconds (3 days)
export const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

// Check if a user is within the grace period
export function isWithinGracePeriod(periodEnd: string | null): boolean {
  if (!periodEnd) return false;
  const gracePeriodEnd = new Date(periodEnd).getTime() + GRACE_PERIOD_MS;
  return Date.now() < gracePeriodEnd;
}

// Check if a user has active donor status based on subscription
export function hasActiveDonorStatus(
  isDonor: boolean,
  subscriptionStatus: string | null,
  periodEnd: string | null,
  email: string | null
): boolean {
  // Admin bypass
  if (email && ADMIN_EMAILS.includes(email)) {
    return true;
  }

  // Not marked as donor
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
