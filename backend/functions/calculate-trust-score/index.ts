import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { user_id } = await req.json();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  
  const { data: metrics } = await supabase.from('user_metrics').select('*').eq('user_id', user_id).single();
  if (!metrics) return new Response(JSON.stringify({ error: 'No metrics' }), { status: 404 });
  
  const punctuality = (metrics.total_contributions - metrics.late_payments - metrics.missed_payments) / (metrics.total_contributions || 1);
  const score = Math.floor(300 + punctuality * 400 + (metrics.groups_completed * 20));
  const finalScore = Math.min(900, Math.max(0, score));
  
  await supabase.from('trust_scores').upsert({ user_id, score: finalScore, updated_at: new Date().toISOString() });
  return new Response(JSON.stringify({ success: true, score: finalScore }), { status: 200 });
});
