import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DonorContextType {
  isDonor: boolean;
  isLoading: boolean;
  refetchDonorStatus: () => Promise<void>;
}

const DonorContext = createContext<DonorContextType | undefined>(undefined);

export function DonorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isDonor, setIsDonor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDonorStatus = useCallback(async () => {
    if (!user) {
      setIsDonor(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_donor')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching donor status:', error);
        setIsDonor(false);
      } else {
        setIsDonor(data?.is_donor ?? false);
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
    refetchDonorStatus,
  }), [isDonor, isLoading, refetchDonorStatus]);

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
