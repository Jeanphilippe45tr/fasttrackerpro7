import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SECRET = Deno.env.get('ADMIN_TOKEN_SECRET')!
const enc = new TextEncoder()

async function hmac(body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function verifyToken(token: string | null): Promise<any | null> {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  if ((await hmac(body)) !== sig) return null
  try {
    const p = JSON.parse(atob(body))
    return typeof p.exp === 'number' && p.exp > Date.now() ? p : null
  } catch {
    return null
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

const ALNUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
function randCode(len: number) {
  let out = ''
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  for (let i = 0; i < len; i++) out += ALNUM[bytes[i] % ALNUM.length]
  return out
}

async function generateTrackingCode(supabase: any, prefix: string) {
  for (let i = 0; i < 40; i++) {
    const code = `${prefix}-${randCode(8)}`
    const [{ data: used }, { data: existing }] = await Promise.all([
      supabase.from('used_tracking_codes').select('code').eq('code', code).maybeSingle(),
      supabase.from('clients').select('id').eq('tracking_code', code).maybeSingle(),
    ])
    if (!used && !existing) {
      await supabase.from('used_tracking_codes').insert({ code })
      return code
    }
  }
  throw new Error('Unable to generate a unique tracking code')
}

const STATUSES = ['pending', 'in_transit', 'delivered', 'failed']
const MODES = ['road', 'sea', 'air', 'rail']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const claims = await verifyToken(token)
  if (!claims || claims.role !== 'admin') return json({ error: 'Unauthorized' }, 401)

  const adminId = claims.id as string
  const prefix = claims.prefix as string

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  const { action, data } = payload ?? {}

  // Helper: ensure a client belongs to this admin
  async function ownClient(id: string) {
    const { data: c } = await supabase.from('clients').select('*').eq('id', id).eq('admin_id', adminId).maybeSingle()
    return c
  }

  try {
    switch (action) {
      case 'me': {
        const { data: ad } = await supabase
          .from('admins').select('id, name, email, phone, company_name, admin_prefix, must_change_password')
          .eq('id', adminId).maybeSingle()
        return json({ admin: ad })
      }
      case 'listClients': {
        const { data: clients, error } = await supabase
          .from('clients').select('*').eq('admin_id', adminId).order('created_at', { ascending: false })
        if (error) throw error
        return json({ clients: clients ?? [] })
      }
      case 'getClient': {
        const c = await ownClient(String(data?.id ?? ''))
        if (!c) return json({ error: 'not_found' }, 404)
        const { data: events } = await supabase
          .from('tracking_events').select('*').eq('tracking_code', c.tracking_code)
          .order('event_time', { ascending: false })
        const { data: tickets } = await supabase
          .from('tickets').select('*').eq('shipment_id', c.id)
          .order('created_at', { ascending: false })
        return json({ client: c, events: events ?? [], tickets: tickets ?? [] })
      }
      case 'createClient': {
        const clientName = String(data?.clientName ?? '').trim()
        if (!clientName) return json({ error: 'Client name is required' }, 400)
        const status = STATUSES.includes(data?.status) ? data.status : 'pending'
        const transportMode = MODES.includes(data?.transportMode) ? data.transportMode : 'road'
        const trackingCode = await generateTrackingCode(supabase, prefix)
        const { data: created, error } = await supabase.from('clients').insert({
          admin_id: adminId,
          client_name: clientName,
          phone: String(data?.phone ?? ''),
          email: String(data?.email ?? ''),
          tracking_code: trackingCode,
          shipment_description: String(data?.shipmentDescription ?? ''),
          origin: String(data?.origin ?? ''),
          destination: String(data?.destination ?? ''),
          status,
          transport_mode: transportMode,
        }).select('*').single()
        if (error) throw error
        await supabase.from('tracking_events').insert({
          tracking_code: trackingCode,
          event_description: 'Shipment registered',
          location: String(data?.origin ?? ''),
          updated_by_admin_id: adminId,
        })
        return json({ ok: true, client: created })
      }
      case 'updateClient': {
        const c = await ownClient(String(data?.id ?? ''))
        if (!c) return json({ error: 'not_found' }, 404)
        const updates: Record<string, unknown> = {}
        if (data?.clientName !== undefined) updates.client_name = String(data.clientName)
        if (data?.phone !== undefined) updates.phone = String(data.phone)
        if (data?.email !== undefined) updates.email = String(data.email)
        if (data?.shipmentDescription !== undefined) updates.shipment_description = String(data.shipmentDescription)
        if (data?.origin !== undefined) updates.origin = String(data.origin)
        if (data?.destination !== undefined) updates.destination = String(data.destination)
        if (data?.status !== undefined && STATUSES.includes(data.status)) updates.status = data.status
        if (data?.transportMode !== undefined && MODES.includes(data.transportMode)) updates.transport_mode = data.transportMode
        if (data?.progress !== undefined) {
          const p = Math.max(0, Math.min(100, Math.round(Number(data.progress) || 0)))
          updates.progress = p
        }
        const { data: updated, error } = await supabase
          .from('clients').update(updates).eq('id', c.id).eq('admin_id', adminId).select('*').single()
        if (error) throw error
        return json({ ok: true, client: updated })
      }
      case 'deleteClient': {
        const c = await ownClient(String(data?.id ?? ''))
        if (!c) return json({ error: 'not_found' }, 404)
        // tracking code stays recorded in used_tracking_codes -> never reused
        const { error } = await supabase.from('clients').delete().eq('id', c.id).eq('admin_id', adminId)
        if (error) throw error
        return json({ ok: true })
      }
      case 'addEvent': {
        const c = await ownClient(String(data?.clientId ?? ''))
        if (!c) return json({ error: 'not_found' }, 404)
        const desc = String(data?.eventDescription ?? '').trim()
        if (!desc) return json({ error: 'Event description is required' }, 400)
        const { error } = await supabase.from('tracking_events').insert({
          tracking_code: c.tracking_code,
          event_description: desc,
          location: String(data?.location ?? ''),
          updated_by_admin_id: adminId,
        })
        if (error) throw error
        return json({ ok: true })
      }
      case 'listTickets': {
        const c = await ownClient(String(data?.clientId ?? ''))
        if (!c) return json({ error: 'not_found' }, 404)
        const { data: tickets } = await supabase
          .from('tickets').select('*').eq('shipment_id', c.id)
          .order('created_at', { ascending: false })
        return json({ tickets: tickets ?? [] })
      }
      case 'addTicket': {
        const c = await ownClient(String(data?.clientId ?? ''))
        if (!c) return json({ error: 'not_found' }, 404)
        const ttype = data?.ticketType === 'pending' ? 'pending' : 'paid'
        const { data: created, error } = await supabase.from('tickets').insert({
          shipment_id: c.id,
          ticket_number: String(data?.ticketNumber ?? `TKT-${Date.now()}`),
          ticket_type: ttype,
          title: String(data?.title ?? ''),
          amount: Number(data?.amount ?? 0),
          currency: String(data?.currency ?? 'EUR'),
          items: Array.isArray(data?.items) ? data.items : [],
          notes: String(data?.notes ?? ''),
          issued_to: String(data?.issuedTo ?? c.client_name),
          issued_by: String(data?.issuedBy ?? 'EuroTransit Admin'),
          due_date: data?.dueDate || null,
          payment_method: String(data?.paymentMethod ?? ''),
          tax_rate: Number(data?.taxRate ?? 0),
          discount: Number(data?.discount ?? 0),
        }).select('*').single()
        if (error) throw error
        return json({ ok: true, ticket: created })
      }
      case 'deleteTicket': {
        const ticketId = String(data?.id ?? '')
        if (!ticketId) return json({ error: 'id required' }, 400)
        const { data: tk } = await supabase.from('tickets').select('shipment_id').eq('id', ticketId).maybeSingle()
        if (!tk) return json({ error: 'not_found' }, 404)
        const owner = await ownClient(String(tk.shipment_id))
        if (!owner) return json({ error: 'not_found' }, 404)
        const { error } = await supabase.from('tickets').delete().eq('id', ticketId)
        if (error) throw error
        return json({ ok: true })
      }
      case 'listMessages': {
        const c = await ownClient(String(data?.clientId ?? ''))
        if (!c) return json({ error: 'not_found' }, 404)
        const { data: msgs } = await supabase
          .from('chat_messages').select('*').eq('shipment_id', c.id)
          .order('created_at', { ascending: true })
        return json({ messages: msgs ?? [] })
      }
      case 'sendMessage': {
        const c = await ownClient(String(data?.clientId ?? ''))
        if (!c) return json({ error: 'not_found' }, 404)
        const message = String(data?.message ?? '').trim()
        if (!message || message.length > 2000) return json({ error: 'Invalid message' }, 400)
        const { error } = await supabase.from('chat_messages').insert({
          shipment_id: c.id, sender: 'admin', message,
          read_by_admin: true, read_by_client: false,
        })
        if (error) throw error
        return json({ ok: true })
      }
      case 'markRead': {
        const c = await ownClient(String(data?.clientId ?? ''))
        if (!c) return json({ error: 'not_found' }, 404)
        const { error } = await supabase.from('chat_messages')
          .update({ read_by_admin: true }).eq('shipment_id', c.id).eq('sender', 'client')
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