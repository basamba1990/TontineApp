import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  try {
    const { user_id } = await req.json()

    const { data: metrics } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (!metrics) {
      return new Response(JSON.stringify({ success: false, message: 'No metrics found' }), { status: 404 })
    }

    const total = metrics.total_contributions || 1
    const on_time = total - metrics.late_payments - metrics.missed_payments

    const score =
      50 +
      (on_time / total) * 40 -
      (metrics.late_payments / total) * 20 -
      (metrics.missed_payments / total) * 30 +
      (metrics.groups_completed * 2)

    const finalScore = Math.max(0, Math.min(100, Math.round(score)))

    await supabase
      .from('users')
      .update({ trust_score: finalScore })
      .eq('id', user_id)

    return new Response(JSON.stringify({ success: true, score: finalScore }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
