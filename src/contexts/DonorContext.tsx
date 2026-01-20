import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { hasActiveDonorStatus, ADMIN_EMAILS } from '@/lib/stripe';

interface SubscriptionInfo {
  status: string | null;
  priceId: string | null;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

interface DonorContextType {
  isDonor: boolean;
  isLoading: boolean;
  subscription: SubscriptionInfo;
  refetchDonorStatus: () => Promise<void>;
}

const DonorContext = createContext<DonorContextType | undefined>(undefined);

export function DonorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isDonor, setIsDonor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: null,
    priceId: null,
    periodEnd: null,
    cancelAtPeriodEnd: false,
    stripeCustomerId: null,
  });

  const fetchDonorStatus = useCallback(async () => {
    if (!user) {
      setIsDonor(false);
      setSubscription({
        status: null,
        priceId: null,
        periodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_donor, subscription_status, subscription_price_id, subscription_current_period_end, subscription_cancel_at_period_end, stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching donor status:', error);
        setIsDonor(false);
      } else {
        const subInfo: SubscriptionInfo = {
          status: data?.subscription_status ?? null,
          priceId: data?.subscription_price_id ?? null,
          periodEnd: data?.subscription_current_period_end ?? null,
          cancelAtPeriodEnd: data?.subscription_cancel_at_period_end ?? false,
          stripeCustomerId: data?.stripe_customer_id ?? null,
        };
        setSubscription(subInfo);

        // Calculate effective donor status
        const effectiveDonor = hasActiveDonorStatus(
          data?.is_donor ?? false,
          subInfo.status,
          subInfo.periodEnd,
          user.email ?? null
        );
        setIsDonor(effectiveDonor);
      }
    } catch (error) {
      console.error('Error fetching donor status:', error);
      setIsDonor(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDonorStatus();
  }, [fetchDonorStatus]);

  const refetchDonorStatus = useCallback(async () => {
    await fetchDonorStatus();
  }, [fetchDonorStatus]);

  const value = useMemo(() => ({
    isDonor,
    isLoading,
    subscription,
    refetchDonorStatus,
  }), [isDonor, isLoading, subscription, refetchDonorStatus]);

  return (
    <DonorContext.Provider value={value}>
      {children}
    </DonorContext.Provider>
  );
}

export function useDonor() {
  const context = useContext(DonorContext);
  if (context === undefined) {
    throw new Error('useDonor must be used within a DonorProvider');
  }
  return context;
}
