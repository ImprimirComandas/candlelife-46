
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Hello from get-chat-users!");

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { p_user_id } = await req.json()

    // Get all messages involving the user
    const { data: messages, error } = await supabaseClient
      .from('messages')
      .select(`
        id,
        sender_id,
        recipient_id,
        content,
        created_at,
        read,
        sender_profile:profiles!messages_sender_id_fkey(username, avatar_url),
        recipient_profile:profiles!messages_recipient_id_fkey(username, avatar_url)
      `)
      .or(`sender_id.eq.${p_user_id},recipient_id.eq.${p_user_id}`)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Group by conversation partner
    const conversationMap = new Map()
    
    messages?.forEach((msg) => {
      const isFromMe = msg.sender_id === p_user_id
      const partnerId = isFromMe ? msg.recipient_id : msg.sender_id
      const partnerProfile = isFromMe ? msg.recipient_profile : msg.sender_profile
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          user_id: partnerId,
          username: partnerProfile?.username || 'Usuário',
          avatar_url: partnerProfile?.avatar_url,
          last_message: {
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            created_at: msg.created_at,
            read: msg.read,
            message_status: 'sent'
          },
          unread_count: 0
        })
      }
    })

    const chatUsers = Array.from(conversationMap.values())

    return new Response(
      JSON.stringify(chatUsers),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
