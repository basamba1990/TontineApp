import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  const { wallet_id, amount, receiver_email, currency } = await req.json()
  const authHeader = req.headers.get('Authorization')!
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 })

  try {
    // 1. Find receiver
    const { data: receiver, error: rError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', receiver_email)
      .single()

    if (rError || !receiver) throw new Error('Destinataire introuvable')
    if (receiver.id === user.id) throw new Error('Vous ne pouvez pas vous envoyer d\'argent à vous-même')

    // 2. Perform transaction in a database RPC (to ensure atomicity)
    // For the sake of this example, we'll simulate it with individual calls, 
    // but in production, this should be a single Postgres function.
    
    // Check sender balance
    const { data: senderWallet, error: swError } = await supabaseClient
      .from('wallets')
      .select('balance')
      .eq('id', wallet_id)
      .eq('user_id', user.id)
      .single()

    if (swError || !senderWallet) throw new Error('Wallet expéditeur introuvable')
    if (senderWallet.balance < amount) throw new Error('Solde insuffisant')

    // Find or create receiver wallet for the same currency
    const { data: receiverWallet, error: rwError } = await supabaseClient
      .from('wallets')
      .select('id')
      .eq('user_id', receiver.id)
      .eq('currency', currency)
      .single()

    let finalReceiverWalletId = receiverWallet?.id

    if (!finalReceiverWalletId) {
      const { data: newWallet, error: nwError } = await supabaseClient
        .from('wallets')
        .insert({ user_id: receiver.id, currency, balance: 0, country_code: 'SN' })
        .select('id')
        .single()
      if (nwError) throw nwError
      finalReceiverWalletId = newWallet.id
    }

    // Update balances (Ideally use a transaction or RPC)
    await supabaseClient.from('wallets').update({ balance: senderWallet.balance - amount }).eq('id', wallet_id)
    
    const { data: rwData } = await supabaseClient.from('wallets').select('balance').eq('id', finalReceiverWalletId).single()
    await supabaseClient.from('wallets').update({ balance: (rwData?.balance || 0) + amount }).eq('id', finalReceiverWalletId)

    // Record transactions
    await supabaseClient.from('transactions').insert([
      { user_id: user.id, wallet_id, amount, currency, type: 'transfer', status: 'completed', description: `Envoyé à ${receiver_email}`, receiver_id: receiver.id },
      { user_id: receiver.id, wallet_id: finalReceiverWalletId, amount, currency, type: 'transfer', status: 'completed', description: `Reçu de ${user.email}` }
    ])

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
})
