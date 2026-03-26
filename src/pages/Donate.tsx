import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Check, Sparkles, History, Palette, Music, Timer, BookOpen, ListChecks, Milestone, Wand2, Loader2, ExternalLink, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useDonor } from "@/contexts/DonorContext";
import { STRIPE_PRICES } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

const freeFeatures = [
  { icon: BookOpen, label: "Guided prayer with 3 biblical frameworks" },
  { icon: ListChecks, label: "Prayer requests with tags" },
  { icon: Milestone, label: "Stones of Remembrance" },
  { icon: Wand2, label: "5 AI-generated prayers per day" },
  { icon: History, label: "30-day session history" },
];

const premiumFeatures = [
  { icon: Sparkles, label: "Custom prayer format builder" },
  { icon: Wand2, label: "10 AI-generated prayers per day" },
  { icon: History, label: "Unlimited session history" },
  { icon: Palette, label: "Custom color themes" },
  { icon: Music, label: "Upload your own ambient audio" },
  { icon: Timer, label: "Meditation timer" },
];

export default function Donate() {
  const { user } = useAuth();
  const { isDonor, subscription } = useDonor();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      navigate('/auth?signup=true');
      return;
    }
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

  const getCurrentPlan = () => {
    if (subscription.priceId === STRIPE_PRICES.monthly.id) return 'Monthly';
    if (subscription.priceId === STRIPE_PRICES.yearly.id) return 'Yearly';
    return 'Supporter';
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Back button */}
        <Link
          to={user ? "/home" : "/"}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Support Selah
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-lg mx-auto">
            Your support keeps Selah running and helps us build new features for the community.
          </p>
        </div>

        {/* Active subscriber view */}
        {isDonor && subscription.status && subscription.status !== 'none' ? (
          <Card className="mb-8 border-primary/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-serif font-medium text-foreground">
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
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
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Pricing comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Free Tier */}
              <Card className="border-muted-foreground/20">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="font-serif text-xl font-medium text-foreground">Free</h2>
                    <p className="text-3xl font-serif font-bold text-foreground mt-1">$0</p>
                    <p className="text-sm text-muted-foreground mt-1">Free forever</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {freeFeatures.map((feature) => (
                      <li key={feature.label} className="flex items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Check className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-foreground">{feature.label}</span>
                      </li>
                    ))}
                  </ul>

                  {!user ? (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/auth?signup=true">Get Started Free</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Your Current Plan
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Supporter Tier */}
              <Card className="border-primary/30 relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1">
                  Recommended
                </Badge>
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="font-serif text-xl font-medium text-foreground">Supporter</h2>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-3xl font-serif font-bold text-foreground">$5</p>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      or $40/year <span className="text-primary font-medium">(save 33%)</span>
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-foreground font-medium">Everything in Free, plus:</span>
                    </li>
                    {premiumFeatures.map((feature) => (
                      <li key={feature.label} className="flex items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{feature.label}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Subscription buttons */}
                  <div className="space-y-2">
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleSubscribe('yearly')}
                      disabled={loadingPlan !== null}
                    >
                      {loadingPlan === 'yearly' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Heart className="w-4 h-4" />
                      )}
                      Subscribe Yearly — $40/year
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handleSubscribe('monthly')}
                      disabled={loadingPlan !== null}
                    >
                      {loadingPlan === 'monthly' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                      Subscribe Monthly — $5/month
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground max-w-md mx-auto">
          Selah will always have a fully functional free tier. Your support helps keep it running and growing.
        </p>
      </div>
    </div>
  );
}
