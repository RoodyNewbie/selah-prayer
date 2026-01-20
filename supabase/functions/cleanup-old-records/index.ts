import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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
      console.error('Error deleting old prayer_generations:', genError);
      results.prayerGenerations.error = genError.message;
    } else {
      results.prayerGenerations.deleted = deletedGenerations?.length || 0;
      console.log(`Deleted ${results.prayerGenerations.deleted} prayer_generations older than 7 days`);
    }

    // 2. Delete prayer_sessions older than 30 days for FREE users only
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // First, get all free user IDs (is_donor = false)
    const { data: freeUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('is_donor', false);
    
    if (usersError) {
      console.error('Error fetching free users:', usersError);
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
        console.error('Error deleting old prayer_sessions:', sessionsError);
        results.freeUserSessions.error = sessionsError.message;
      } else {
        results.freeUserSessions.deleted = deletedSessions?.length || 0;
        console.log(`Deleted ${results.freeUserSessions.deleted} prayer_sessions older than 30 days for free users`);
      }
      
      // Also clean up prayer_topics linked to deleted sessions (orphaned by cascade)
      // and old topics for free users
      const { error: topicsError } = await supabaseAdmin
        .from('prayer_topics')
        .delete()
        .in('user_id', freeUserIds)
        .lt('created_at', thirtyDaysAgo);
      
      if (topicsError) {
        console.error('Error deleting old prayer_topics:', topicsError);
      }
    }

    console.log('Cleanup completed:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in cleanup-old-records:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
