import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Safely convert a Stripe timestamp to an ISO string.
// Handles both Unix seconds (number) and ISO strings (newer API versions).
const toISOString = (timestamp: unknown): string | null => {
  if (timestamp == null) return null;
  if (typeof timestamp === "number") {
    return new Date(timestamp * 1000).toISOString();
  }
  if (typeof timestamp === "string") {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  }
  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    // Debug: confirm which secret is loaded without leaking it
    logStep("Webhook secret loaded", {
      prefix: webhookSecret.slice(0, 10),
      length: webhookSecret.length,
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Stripe signature verification requires the exact raw request payload.
    const rawBodyBytes = await req.arrayBuffer();
    const body = new TextDecoder().decode(rawBodyBytes);
    logStep("Received request", {
      hasSignature: true,
      signaturePrefix: signature.slice(0, 10),
      bodyLength: body.length,
    });
    let event: Stripe.Event;

    try {
      // Use constructEventAsync with SubtleCrypto provider for Deno compatibility.
      // The synchronous constructEvent relies on Node.js crypto which doesn't work
      // correctly in Deno/Supabase Edge Functions via esm.sh polyfills.
      const cryptoProvider = Stripe.createSubtleCryptoProvider();
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    logStep("Received webhook event", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { 
          sessionId: session.id,
          customerId: session.customer,
          clientReferenceId: session.client_reference_id
        });

        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          logStep("No client_reference_id found, skipping");
          break;
        }

        if (!subscriptionId) {
          logStep("No subscription on checkout session, skipping");
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const periodEnd = toISOString(subscription.current_period_end);

        // Update user profile with subscription info
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_price_id: priceId,
            subscription_current_period_end: periodEnd,
            subscription_cancel_at_period_end: false,
            is_donor: true,
          })
          .eq('user_id', userId);

        if (updateError) {
          logStep("Error updating profile", { error: updateError.message });
          throw updateError;
        }

        logStep("Successfully processed checkout", { userId, customerId, subscriptionId });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.updated", { 
          subscriptionId: subscription.id,
          status: subscription.status
        });

        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;
        const periodEnd = toISOString(subscription.current_period_end);
        const cancelAtPeriodEnd = subscription.cancel_at_period_end;

        // Map Stripe status to our status
        let subscriptionStatus = subscription.status;
        if (cancelAtPeriodEnd && subscription.status === 'active') {
          subscriptionStatus = 'active'; // Still active until period ends
        }

        // Find user by stripe_customer_id
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          logStep("Could not find profile for customer", { customerId });
          break;
        }

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: subscriptionStatus,
            subscription_price_id: priceId,
            subscription_current_period_end: periodEnd,
            subscription_cancel_at_period_end: cancelAtPeriodEnd,
            is_donor: subscriptionStatus === 'active' || subscriptionStatus === 'trialing',
          })
          .eq('user_id', profile.user_id);

        if (updateError) {
          logStep("Error updating subscription", { error: updateError.message });
          throw updateError;
        }

        logStep("Successfully updated subscription", { userId: profile.user_id, status: subscriptionStatus });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", { 
          subscriptionId: subscription.id 
        });

        const customerId = subscription.customer as string;
        const periodEnd = toISOString(subscription.current_period_end);

        // Find user by stripe_customer_id
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          logStep("Could not find profile for customer", { customerId });
          break;
        }

        // Set grace period - user keeps donor status for 3 days after subscription ends
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'grace_period',
            subscription_current_period_end: periodEnd,
            subscription_cancel_at_period_end: true,
            is_donor: true, // Keep donor status during grace period
          })
          .eq('user_id', profile.user_id);

        if (updateError) {
          logStep("Error updating subscription", { error: updateError.message });
          throw updateError;
        }

        logStep("Successfully set grace period", { userId: profile.user_id });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.paid", { invoiceId: invoice.id });

        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          logStep("No subscription on invoice, skipping");
          break;
        }

        // Get subscription details for updated period end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = toISOString(subscription.current_period_end);

        // Find user by stripe_customer_id
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          logStep("Could not find profile for customer", { customerId });
          break;
        }

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_current_period_end: periodEnd,
            is_donor: true,
          })
          .eq('user_id', profile.user_id);

        if (updateError) {
          logStep("Error updating after invoice paid", { error: updateError.message });
          throw updateError;
        }

        logStep("Successfully confirmed payment", { userId: profile.user_id });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_failed", { invoiceId: invoice.id });

        const customerId = invoice.customer as string;

        // Find user by stripe_customer_id
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          logStep("Could not find profile for customer", { customerId });
          break;
        }

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'past_due',
          })
          .eq('user_id', profile.user_id);

        if (updateError) {
          logStep("Error updating subscription status", { error: updateError.message });
          throw updateError;
        }

        logStep("Marked subscription as past_due", { userId: profile.user_id });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
