// Stripe configuration - loaded from environment variables
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

if (!STRIPE_PUBLISHABLE_KEY && import.meta.env.MODE !== 'test') {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not set. Stripe payments will not work.');
}

export const STRIPE_PRICES = {
  monthly: {
    id: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_monthly',
    amount: 5,
    interval: 'month' as const,
    label: '$5/month',
  },
  yearly: {
    id: import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_yearly',
    amount: 40,
    interval: 'year' as const,
    label: '$40/year',
    savings: 'Save 33%',
  },
} as const;

// Admin emails that always have donor access - loaded from environment variable
// Format: comma-separated list of emails in VITE_ADMIN_EMAILS
const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || '';
export const ADMIN_EMAILS: string[] = adminEmailsEnv
  ? adminEmailsEnv.split(',').map((email: string) => email.trim()).filter(Boolean)
  : [];

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
