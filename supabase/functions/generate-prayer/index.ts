import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://selah-prayer.lovable.app',
  'https://id-preview--08ab0c83-ad50-4df7-9c20-fd72f6197a42.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  // Strict origin check - only exact matches
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

interface PrayerPhases {
  praise?: string;
  will?: string;
  needs?: string;
  forgiveness?: string;
  protection?: string;
  worship?: string;
}

// Input validation constants
const VALID_PHASE_KEYS = ['praise', 'will', 'needs', 'forgiveness', 'protection', 'worship'];
const MAX_PHASE_LENGTH = 1000;
const MAX_TOTAL_LENGTH = 5000;

// Daily generation limits
const FREE_USER_DAILY_LIMIT = 5;
const DONOR_DAILY_LIMIT = 10;

function validatePrayerPhases(phases: unknown): { valid: boolean; error?: string; sanitized?: PrayerPhases } {
  if (!phases || typeof phases !== 'object' || Array.isArray(phases)) {
    return { valid: false, error: 'Invalid phases format: must be an object' };
  }

  const sanitized: PrayerPhases = {};
  let totalLength = 0;

  for (const [key, value] of Object.entries(phases)) {
    if (!VALID_PHASE_KEYS.includes(key)) {
      return { valid: false, error: `Invalid phase key: ${key}` };
    }

    if (value === null || value === undefined || value === '') {
      continue;
    }

    if (typeof value !== 'string') {
      return { valid: false, error: `Phase "${key}" must be a string` };
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > MAX_PHASE_LENGTH) {
      return { valid: false, error: `Phase "${key}" exceeds maximum length of ${MAX_PHASE_LENGTH} characters` };
    }

    totalLength += trimmedValue.length;
    if (totalLength > MAX_TOTAL_LENGTH) {
      return { valid: false, error: `Total content exceeds maximum length of ${MAX_TOTAL_LENGTH} characters` };
    }

    if (trimmedValue) {
      sanitized[key as keyof PrayerPhases] = trimmedValue;
    }
  }

  return { valid: true, sanitized };
}

async function checkDailyLimit(
  supabaseAdmin: any,
  userId: string,
  isDonor: boolean
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = isDonor ? DONOR_DAILY_LIMIT : FREE_USER_DAILY_LIMIT;
  
  // Get count of generations in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { count, error } = await supabaseAdmin
    .from('prayer_generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', twentyFourHoursAgo);
  
  if (error) {
    console.error('Error checking daily limit:', error);
    // On error, DENY the request to prevent rate limit bypass
    return { allowed: false, remaining: 0, limit };
  }
  
  const usedCount = count || 0;
  const remaining = Math.max(0, limit - usedCount);
  
  return {
    allowed: usedCount < limit,
    remaining,
    limit,
  };
}

async function recordGeneration(
  supabaseAdmin: any,
  userId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('prayer_generations')
    .insert({ user_id: userId });
  
  if (error) {
    console.error('Error recording generation:', error);
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user-context client for auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Create admin client for checking limits and recording generations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Check if user is a donor
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_donor')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }
    
    const isDonor = profile?.is_donor ?? false;
    console.log("User donor status:", isDonor);

    // Check daily generation limit
    const limitCheck = await checkDailyLimit(supabaseAdmin, user.id, isDonor);
    
    if (!limitCheck.allowed) {
      const errorMessage = isDonor 
        ? "Daily limit reached. Try again tomorrow!"
        : "Daily limit reached. Upgrade to donor for more generations!";
      
      console.log(`User ${user.id} hit daily limit: ${limitCheck.limit} generations`);
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          remaining: 0,
          limit: limitCheck.limit,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    
    // Validate input phases
    const validation = validatePrayerPhases(body.phases);
    if (!validation.valid) {
      console.error("Input validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phases = validation.sanitized!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the context from the prayer phases
    const phaseLabels: Record<string, string> = {
      praise: "Praise & Gratitude",
      will: "Surrendering to God's Will",
      needs: "Practical Needs & Requests",
      forgiveness: "Confession & Forgiveness",
      protection: "Seeking Protection",
      worship: "Closing Worship"
    };

    const prayerContext = Object.entries(phases)
      .filter(([_, content]) => content && content.trim())
      .map(([phase, content]) => `${phaseLabels[phase] || phase}: ${content}`)
      .join("\n\n");

    if (!prayerContext.trim()) {
      // Still record this as a generation
      await recordGeneration(supabaseAdmin, user.id);
      
      return new Response(
        JSON.stringify({ 
          prayer: "Lord, thank You for this moment of quiet reflection. Be with me in all that I do. Amen.",
          remaining: limitCheck.remaining - 1,
          limit: limitCheck.limit,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a gentle, reverent prayer writer who crafts beautiful, heartfelt prayers in a warm, conversational tone with God. 

Your task is to take the user's prayer notes from different phases of their prayer time and weave them into one cohesive, flowing prayer.

Guidelines:
- Write in first person, addressing God directly (Dear Lord, Heavenly Father, etc.)
- Maintain a reverent but intimate tone - like speaking to a loving Father
- Naturally incorporate their specific thoughts and concerns
- Use simple, sincere language - avoid overly formal religious jargon
- The prayer should feel personal and genuine, not generic
- Include appropriate transitions between themes
- End with "Amen."
- Keep the prayer focused and meaningful, typically 150-300 words
- Honor the emotional weight of what they shared (especially in confession/forgiveness sections)`;

    const userPrompt = `Please transform these prayer notes into a beautiful, flowing prayer:

${prayerContext}`;

    console.log("Generating prayer for user:", user.id, "- phases:", Object.keys(phases).filter(k => phases[k as keyof PrayerPhases]?.trim()));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to generate prayer");
    }

    const data = await response.json();
    const generatedPrayer = data.choices?.[0]?.message?.content || "Lord, hear my prayer. Amen.";

    // Record the successful generation
    await recordGeneration(supabaseAdmin, user.id);

    console.log("Prayer generated successfully for user:", user.id);

    return new Response(
      JSON.stringify({ 
        prayer: generatedPrayer,
        remaining: limitCheck.remaining - 1,
        limit: limitCheck.limit,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-prayer:", error);
    // Don't leak internal error details to the client
    return new Response(
      JSON.stringify({ error: "Unable to generate prayer. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
