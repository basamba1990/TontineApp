import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { memberId, amount, phoneNumber } = await req.json();
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });

  try {
    // Appel API Mobile Money (simulation)
    // const paymentRes = await fetch("https://api.wave.com/payment", { method: "POST", headers: { "Authorization": `Bearer ${Deno.env.get("MOMO_KEY")}` }, body: JSON.stringify({ to: "TONTINE_ESCROW", from: phoneNumber, amount }) });
    // if (!paymentRes.ok) throw new Error("Payment failed");

    // Mise à jour base de données
    await supabase.from('contributions').insert({ member_id: memberId, amount, status: 'paid', payment_date: new Date().toISOString() });
    await supabase.from('user_metrics').update({ total_contributions: supabase.rpc('increment', { x: 1 }) }).eq('user_id', memberId);
    
    // Déclencher le scoring
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/calculate-trust-score`, { method: 'POST', headers: { Authorization: authHeader }, body: JSON.stringify({ user_id: memberId }) });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 400 }); }
});
