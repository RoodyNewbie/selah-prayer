import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  "https://selah-prayer.lovable.app",
];

function getCorsHeaders(origin: string | null) {
  // Strict origin check - only exact matches, no substring matching
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    const { priceId } = await req.json();
    if (!priceId) throw new Error("priceId is required");

    // Allowlist: only accept known Selah Supporter price IDs
    const VALID_PRICE_IDS = new Set([
      'price_1TC8v2BAwfR8W0DxStp8uNy8', // monthly
      'price_1TC8v1BAwfR8W0Dxskg5vUDZ', // yearly
    ]);
    if (!VALID_PRICE_IDS.has(priceId)) {
      throw new Error("Invalid price selected");
    }

    logStep("Received priceId", { priceId });

    // Validate priceId against allowed live prices to prevent checkout manipulation
    const ALLOWED_PRICES = ['price_1TC8v2BAwfR8W0DxStp8uNy8', 'price_1TC8v1BAwfR8W0Dxskg5vUDZ'];
    if (!ALLOWED_PRICES.includes(priceId)) {
      return new Response(JSON.stringify({ error: 'Invalid price selected' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if user already has a stripe_customer_id
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // If no customer ID, check if customer exists in Stripe by email
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        // Update profile with customer ID
        await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user.id);
        logStep("Found existing Stripe customer", { customerId });
      }
    }

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      // Update profile with customer ID
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
      logStep("Created new Stripe customer", { customerId });
    }

    // IMPORTANT: Return the user to the SAME origin that initiated checkout.
    // If we redirect to a different domain (e.g. published vs preview), the auth session
    // stored in localStorage will not exist there and the user will appear logged out.
    const returnBaseUrl = corsHeaders["Access-Control-Allow-Origin"];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnBaseUrl}/settings?payment=success`,
      cancel_url: `${returnBaseUrl}/settings?payment=canceled`,
      allow_promotion_codes: true,
    });

    logStep("Created checkout session", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    // Don't leak internal error details to the client
    const safeMessage = errorMessage.includes("Authentication") || errorMessage.includes("priceId")
      ? errorMessage
      : "An error occurred while creating your checkout session. Please try again.";
    return new Response(JSON.stringify({ error: safeMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
