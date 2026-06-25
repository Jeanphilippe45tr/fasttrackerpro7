import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import webpush from 'npm:web-push@3.6.7'

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  try { webpush.setVapidDetails('mailto:support@eurotransit.app', VAPID_PUBLIC, VAPID_PRIVATE) } catch { /* ignore */ }
}

async function notifyAdmin(supabase: any, adminId: string | null, body: string, url: string) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return
  let q = supabase.from('push_subscriptions').select('*').eq('subscriber_type', 'admin')
  q = adminId ? q.eq('admin_id', adminId) : q.is('admin_id', null)
  const { data: subs } = await q
  if (!subs?.length) return
  const payload = { title: 'Nouveau message client', body: body.slice(0, 120), tag: 'admin-chat', url }
  await Promise.allSettled(subs.map(async (s: any) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      )
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
      }
    }
  }))
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

// Only expose fields a customer needs — never raw client email.
function safeShipment(row: any) {
  if (!row) return null
  return {
    id: row.id,
    tracking_number: row.tracking_number,
    client_name: row.client_name,
    client_email: '',
    origin: row.origin,
    destination: row.destination,
    origin_coords: row.origin_coords,
    dest_coords: row.dest_coords,
    current_coords: row.current_coords,
    status: row.status,
    pause_reason: row.pause_reason,
    transport_mode: row.transport_mode,
    progress: row.progress,
    estimated_arrival: row.estimated_arrival,
    created_at: row.created_at,
    updated_at: row.updated_at,
    weight: row.weight,
    dimensions: row.dimensions,
    package_type: row.package_type,
    route: row.route,
    history: row.history,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  const { action, data } = payload ?? {}
  const trackingNumber = String(data?.trackingNumber ?? '').trim()

  if (!trackingNumber || trackingNumber.length > 64) {
    return json({ error: 'A valid tracking number is required' }, 400)
  }

  // Resolve shipment by tracking number (case-insensitive)
  const { data: shipRow } = await supabase
    .from('shipments').select('*').ilike('tracking_number', trackingNumber).maybeSingle()

  if (!shipRow) {
    // Fall back to the multi-admin clients tracking codes.
    const { data: clientRow } = await supabase
      .from('clients').select('*').ilike('tracking_code', trackingNumber).maybeSingle()
    if (clientRow) {
      // Chat actions for client tracking codes (keyed by clients.id).
      if (action === 'sendMessage') {
        const message = String(data?.message ?? '').trim()
        if (!message || message.length > 2000) return json({ error: 'Invalid message' }, 400)
        const { error } = await supabase.from('chat_messages').insert({
          shipment_id: clientRow.id, sender: 'client', message,
          read_by_admin: false, read_by_client: true,
        })
        if (error) return json({ error: error.message }, 500)
        return json({ ok: true })
      }
      if (action === 'getMessages') {
        const { data: m } = await supabase.from('chat_messages')
          .select('*').eq('shipment_id', clientRow.id).order('created_at', { ascending: true })
        return json({ messages: m ?? [] })
      }
      if (action === 'markRead') {
        await supabase.from('chat_messages')
          .update({ read_by_client: true }).eq('shipment_id', clientRow.id).eq('sender', 'admin')
        return json({ ok: true })
      }
      const { data: events } = await supabase
        .from('tracking_events').select('event_description, location, event_time')
        .eq('tracking_code', clientRow.tracking_code)
        .order('event_time', { ascending: false })
      const { data: tickets } = await supabase
        .from('tickets').select('*').eq('shipment_id', clientRow.id)
        .order('created_at', { ascending: false })
      const { data: messages } = await supabase
        .from('chat_messages').select('*').eq('shipment_id', clientRow.id)
        .order('created_at', { ascending: true })
      // Minimal info only — never expose admin identity.
      return json({
        client: {
          tracking_code: clientRow.tracking_code,
          client_name: clientRow.client_name,
          shipment_description: clientRow.shipment_description,
          origin: clientRow.origin,
          destination: clientRow.destination,
          status: clientRow.status,
          progress: clientRow.progress,
          transport_mode: clientRow.transport_mode,
          created_at: clientRow.created_at,
          updated_at: clientRow.updated_at,
        },
        events: events ?? [],
        tickets: tickets ?? [],
        messages: messages ?? [],
      })
    }
    return json({ error: 'not_found' }, 404)
  }

  try {
    switch (action) {
      case 'track': {
        const [t, m] = await Promise.all([
          supabase.from('tickets').select('*').eq('shipment_id', shipRow.id).order('created_at', { ascending: false }),
          supabase.from('chat_messages').select('*').eq('shipment_id', shipRow.id).order('created_at', { ascending: true }),
        ])
        return json({ shipment: safeShipment(shipRow), tickets: t.data ?? [], messages: m.data ?? [] })
      }
      case 'getMessages': {
        const { data: m } = await supabase.from('chat_messages')
          .select('*').eq('shipment_id', shipRow.id).order('created_at', { ascending: true })
        return json({ messages: m ?? [] })
      }
      case 'sendMessage': {
        const message = String(data?.message ?? '').trim()
        if (!message || message.length > 2000) {
          return json({ error: 'Message must be between 1 and 2000 characters' }, 400)
        }
        // sender is forced to 'client' — no spoofing of admin messages
        const { error } = await supabase.from('chat_messages').insert({
          shipment_id: shipRow.id,
          sender: 'client',
          message,
          read_by_admin: false,
          read_by_client: true,
        })
        if (error) throw error
        return json({ ok: true })
      }
      case 'markRead': {
        const { error } = await supabase.from('chat_messages')
          .update({ read_by_client: true }).eq('shipment_id', shipRow.id)
        if (error) throw error
        return json({ ok: true })
      }
      default:
        return json({ error: 'Unknown action' }, 400)
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})