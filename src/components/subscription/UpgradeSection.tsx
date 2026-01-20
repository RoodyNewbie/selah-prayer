import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Loader2, ExternalLink, Calendar, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDonor } from '@/contexts/DonorContext';
import { STRIPE_PRICES } from '@/lib/stripe';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function UpgradeSection() {
  const { isDonor, subscription, refetchDonorStatus } = useDonor();
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoadingPlan(plan);
    try {
      const priceId = STRIPE_PRICES[plan].id;
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription');

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open subscription management. Please try again.');
    } finally {
      setLoadingPortal(false);
    }
  };

  const getStatusBadge = () => {
    const status = subscription.status;
    if (!status || status === 'none') return null;

    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Active', variant: 'default' },
      trialing: { label: 'Trial', variant: 'secondary' },
      past_due: { label: 'Past Due', variant: 'destructive' },
      grace_period: { label: 'Canceling', variant: 'outline' },
      canceled: { label: 'Canceled', variant: 'outline' },
    };

    const statusInfo = variants[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getCurrentPlan = () => {
    if (subscription.priceId === STRIPE_PRICES.monthly.id) return 'Monthly';
    if (subscription.priceId === STRIPE_PRICES.yearly.id) return 'Yearly';
    return 'Unknown';
  };

  // Show subscription management UI for active subscribers
  if (isDonor && subscription.status && subscription.status !== 'none') {
    return (
      <section>
        <h2 className="font-display text-lg text-foreground mb-4">Your Subscription</h2>
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-body font-medium text-foreground">
                    {getCurrentPlan()} Plan
                  </p>
                  {getStatusBadge()}
                </div>
                <p className="text-sm text-muted-foreground">
                  Thank you for supporting Selah!
                </p>
              </div>
            </div>
          </div>

          {subscription.periodEnd && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {subscription.cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}:{' '}
                {format(new Date(subscription.periodEnd), 'MMMM d, yyyy')}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleManageSubscription}
            disabled={loadingPortal}
          >
            {loadingPortal ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            Manage Subscription
            <ExternalLink className="w-3 h-3 ml-auto" />
          </Button>
        </Card>
      </section>
    );
  }

  // Show upgrade options for non-subscribers
  return (
    <section>
      <h2 className="font-display text-lg text-foreground mb-4">Support Selah</h2>
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-body font-medium text-foreground">
              Unlock Premium Features
            </p>
            <p className="text-sm text-muted-foreground">
              Your support helps keep Selah running and enables continued development.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Monthly Plan */}
          <Card className="p-4 border-2 hover:border-primary/50 transition-colors">
            <div className="text-center space-y-2">
              <p className="font-display text-2xl text-foreground">$5</p>
              <p className="text-sm text-muted-foreground">per month</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubscribe('monthly')}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === 'monthly' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>
          </Card>

          {/* Yearly Plan */}
          <Card className="p-4 border-2 border-primary/30 hover:border-primary/50 transition-colors relative">
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
              Save 33%
            </Badge>
            <div className="text-center space-y-2">
              <p className="font-display text-2xl text-foreground">$40</p>
              <p className="text-sm text-muted-foreground">per year</p>
              <Button
                variant="default"
                className="w-full"
                onClick={() => handleSubscribe('yearly')}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === 'yearly' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>
          </Card>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Includes: Custom colors, custom audio, custom formats, meditation timer, unlimited history, and more generations.
        </p>
      </Card>
    </section>
  );
}
