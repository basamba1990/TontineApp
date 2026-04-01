import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') || ''
})

serve(async (req) => {
  try {
    const { user_id } = await req.json()

    // 1. Fetch user data
    const { data: metrics } = await supabase.from('user_metrics').select('*').eq('user_id', user_id).single()
    const { data: contributions } = await supabase.from('contributions').select('*').eq('user_id', user_id)
    const { data: kyc } = await supabase.from('kyc').select('*').eq('user_id', user_id).single()

    // 2. Prepare prompt
    const prompt = `
      Analyse ce comportement utilisateur dans les tontines africaines pour détecter la fraude.
      Données :
      - total_contributions: ${metrics?.total_contributions || 0}
      - late_payments: ${metrics?.late_payments || 0}
      - missed_payments: ${metrics?.missed_payments || 0}
      - groups_completed: ${metrics?.groups_completed || 0}
      - KYC status: ${kyc?.status || 'none'}
      - contribution_history: ${JSON.stringify(contributions || [])}

      Retourne uniquement un JSON :
      {
        "risque_fraude": (0-100),
        "recommendation": "bloquer" | "surveiller" | "autoriser",
        "raison": "explication courte"
      }
    `

    // 3. Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    })

    const fraudData = JSON.parse(response.choices[0].message.content || '{}')

    // 4. Action if high risk
    if (fraudData.risque_fraude > 70) {
      await supabase
        .from('users')
        .update({ trust_score: 0 })
        .eq('id', user_id)
    }

    return new Response(JSON.stringify({ success: true, fraudData }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
