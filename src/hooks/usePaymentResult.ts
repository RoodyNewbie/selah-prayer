import { useEffect, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDonor } from '@/contexts/DonorContext';

export function usePaymentResult() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { refetchDonorStatus } = useDonor();
  const hasHandled = useRef(false);

  useEffect(() => {
    const payment = searchParams.get('payment');
    
    if (!payment || hasHandled.current) return;
    hasHandled.current = true;

    if (payment === 'success') {
      toast.success('Thank you for your support! Your premium features are now active.', {
        duration: 5000,
      });
      // Refetch donor status to update UI
      refetchDonorStatus();
    } else if (payment === 'canceled') {
      toast.info("No worries! You can upgrade anytime from Settings.", {
        duration: 4000,
      });
    }

    // Remove the payment param from URL and replace history entry
    // This ensures the Stripe checkout URL is removed from the back button history
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('payment');
    const newSearch = newParams.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    
    // Use navigate with replace to remove Stripe from history stack
    navigate(newPath, { replace: true });
  }, [searchParams, location.pathname, navigate, refetchDonorStatus]);
}
