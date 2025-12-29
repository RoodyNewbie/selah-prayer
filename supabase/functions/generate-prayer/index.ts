import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
const MAX_PHASE_LENGTH = 1000; // Max characters per phase
const MAX_TOTAL_LENGTH = 5000; // Max total characters across all phases

function validatePrayerPhases(phases: unknown): { valid: boolean; error?: string; sanitized?: PrayerPhases } {
  if (!phases || typeof phases !== 'object' || Array.isArray(phases)) {
    return { valid: false, error: 'Invalid phases format: must be an object' };
  }

  const sanitized: PrayerPhases = {};
  let totalLength = 0;

  for (const [key, value] of Object.entries(phases)) {
    // Validate phase key
    if (!VALID_PHASE_KEYS.includes(key)) {
      return { valid: false, error: `Invalid phase key: ${key}` };
    }

    // Skip empty/null values
    if (value === null || value === undefined || value === '') {
      continue;
    }

    // Validate value is a string
    if (typeof value !== 'string') {
      return { valid: false, error: `Phase "${key}" must be a string` };
    }

    // Trim and validate length
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

serve(async (req) => {
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
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
      return new Response(
        JSON.stringify({ prayer: "Lord, thank You for this moment of quiet reflection. Be with me in all that I do. Amen." }),
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

    console.log("Prayer generated successfully for user:", user.id);

    return new Response(
      JSON.stringify({ prayer: generatedPrayer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-prayer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
