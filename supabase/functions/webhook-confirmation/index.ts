import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  try {
    const { status, invoice } = await req.json()

    if (status === "completed") {
      const contribution_id = invoice.custom_data.contribution_id
      const user_id = invoice.custom_data.user_id

      // 1. Update contribution status
      await supabase
        .from('contributions')
        .update({ status: 'confirmed' })
        .eq('id', contribution_id)

      // 2. Log payment
      await supabase.from('payments').insert({
        user_id: user_id,
        amount: invoice.total_amount,
        provider: 'PayDunya',
        status: 'confirmed',
        external_id: invoice.token
      })

      // 3. Update user metrics
      const { data: metrics } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', user_id)
        .single()

      if (metrics) {
        await supabase
          .from('user_metrics')
          .update({
            total_contributions: metrics.total_contributions + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user_id)
      } else {
        await supabase.from('user_metrics').insert({
          user_id: user_id,
          total_contributions: 1
        })
      }

      // 4. Trigger trust score recalculation
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/calculate-trust-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ user_id })
      })

      // 5. Send notifications to group members
      const { data: contribution } = await supabase
        .from('contributions')
        .select('group_id, user_id, amount')
        .eq('id', contribution_id)
        .single()

      if (contribution) {
        const { data: members } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', contribution.group_id)

        for (const member of members) {
          // Store in-app notification
          await supabase
            .from('notifications')
            .insert({
              user_id: member.user_id,
              title: '💰 Paiement reçu',
              body: `Un membre a payé ${contribution.amount} CFA pour la tontine.`,
              data: { contribution_id, group_id: contribution.group_id }
            })

          // Send push notification
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
            body: JSON.stringify({
              user_id: member.user_id,
              title: '💰 Paiement reçu',
              body: `Un membre a payé ${contribution.amount} CFA pour la tontine.`,
            })
          })
        }
      }
    }

    return new Response("ok", { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
