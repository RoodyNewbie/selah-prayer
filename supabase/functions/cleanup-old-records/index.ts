import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// No CORS needed - this is a server-to-server scheduled function, not called from browsers.

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Authenticate: require the service role key or a dedicated cleanup secret.
    // When called via Supabase cron (pg_cron / pg_net), the Authorization header
    // carries the service role key. For manual invocations, require CLEANUP_SECRET.
    const authHeader = req.headers.get("Authorization");
    const cleanupSecret = Deno.env.get("CLEANUP_SECRET");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const token = authHeader?.replace("Bearer ", "");
    const isAuthorized =
      (token && serviceRoleKey && token === serviceRoleKey) ||
      (token && cleanupSecret && token === cleanupSecret);

    if (!isAuthorized) {
      console.error("[CLEANUP] Unauthorized request rejected");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const results = {
      prayerGenerations: { deleted: 0, error: null as string | null },
      freeUserSessions: { deleted: 0, error: null as string | null },
    };

    // 1. Delete prayer_generations older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: deletedGenerations, error: genError } = await supabaseAdmin
      .from('prayer_generations')
      .delete()
      .lt('created_at', sevenDaysAgo)
      .select('id');

    if (genError) {
      console.error('[CLEANUP] Error deleting old prayer_generations:', genError);
      results.prayerGenerations.error = genError.message;
    } else {
      results.prayerGenerations.deleted = deletedGenerations?.length || 0;
      console.log(`[CLEANUP] Deleted ${results.prayerGenerations.deleted} prayer_generations older than 7 days`);
    }

    // 2. Delete prayer_sessions older than 30 days for FREE users only
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // First, get all free user IDs (is_donor = false)
    const { data: freeUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('is_donor', false);

    if (usersError) {
      console.error('[CLEANUP] Error fetching free users:', usersError);
      results.freeUserSessions.error = usersError.message;
    } else if (freeUsers && freeUsers.length > 0) {
      const freeUserIds = freeUsers.map(u => u.user_id);

      // Delete old sessions for free users
      const { data: deletedSessions, error: sessionsError } = await supabaseAdmin
        .from('prayer_sessions')
        .delete()
        .in('user_id', freeUserIds)
        .lt('created_at', thirtyDaysAgo)
        .select('id');

      if (sessionsError) {
        console.error('[CLEANUP] Error deleting old prayer_sessions:', sessionsError);
        results.freeUserSessions.error = sessionsError.message;
      } else {
        results.freeUserSessions.deleted = deletedSessions?.length || 0;
        console.log(`[CLEANUP] Deleted ${results.freeUserSessions.deleted} prayer_sessions older than 30 days for free users`);
      }

      // Also clean up old prayer_topics for free users
      const { error: topicsError } = await supabaseAdmin
        .from('prayer_topics')
        .delete()
        .in('user_id', freeUserIds)
        .lt('created_at', thirtyDaysAgo);

      if (topicsError) {
        console.error('[CLEANUP] Error deleting old prayer_topics:', topicsError);
      }
    }

    console.log('[CLEANUP] Completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[CLEANUP] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
