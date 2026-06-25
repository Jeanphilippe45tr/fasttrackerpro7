import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

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
      const { data: events } = await supabase
        .from('tracking_events').select('event_description, location, event_time')
        .eq('tracking_code', clientRow.tracking_code)
        .order('event_time', { ascending: false })
      // Minimal info only — never expose admin identity.
      return json({
        client: {
          tracking_code: clientRow.tracking_code,
          client_name: clientRow.client_name,
          shipment_description: clientRow.shipment_description,
          origin: clientRow.origin,
          destination: clientRow.destination,
          status: clientRow.status,
          created_at: clientRow.created_at,
          updated_at: clientRow.updated_at,
        },
        events: events ?? [],
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