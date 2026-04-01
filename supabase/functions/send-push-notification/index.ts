import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
)

serve(async (req) => {
  try {
    const { user_id, title, body, data } = await req.json()

    const { data: user } = await supabase
      .from("users")
      .select("expo_push_token")
      .eq("id", user_id)
      .single()

    if (!user?.expo_push_token) {
      return new Response(JSON.stringify({ error: "No push token for user" }), { status: 400 })
    }

    const messages = [{
      to: user.expo_push_token,
      sound: "default",
      title,
      body,
      data: data || {},
    }]

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()
    return new Response(JSON.stringify(result), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
