import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SECRET = Deno.env.get('ADMIN_TOKEN_SECRET')!
// Admin credentials (overridable via env). Defaults to the configured admin.
const ADMIN_USERNAME = Deno.env.get('ADMIN_USERNAME') ?? 'makoun'
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') ?? 'makountracking237'

const enc = new TextEncoder()

async function hmac(body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function createToken(): Promise<string> {
  const payload = { role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 12 }
  const body = btoa(JSON.stringify(payload))
  return `${body}.${await hmac(body)}`
}

async function verifyToken(token: string | null): Promise<boolean> {
  if (!token) return false
  const [body, sig] = token.split('.')
  if (!body || !sig) return false
  const expected = await hmac(body)
  if (expected !== sig) return false
  try {
    const payload = JSON.parse(atob(body))
    return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now()
  } catch {
    return false
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
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

  // ---- Public action: login ----
  if (action === 'login') {
    const username = String(data?.username ?? '')
    const password = String(data?.password ?? '')
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return json({ token: await createToken() })
    }
    return json({ error: 'Invalid credentials' }, 401)
  }

  // ---- All other actions require a valid admin token ----
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!(await verifyToken(token))) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    switch (action) {
      case 'load': {
        const [s, m, t] = await Promise.all([
          supabase.from('shipments').select('*').order('created_at', { ascending: false }),
          supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
          supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        ])
        return json({ shipments: s.data ?? [], messages: m.data ?? [], tickets: t.data ?? [] })
      }
      case 'addShipment': {
        const { error } = await supabase.from('shipments').insert(data)
        if (error) throw error
        return json({ ok: true })
      }
      case 'updateShipment': {
        const { id, updates } = data
        const { error } = await supabase.from('shipments').update(updates).eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
      case 'deleteShipment': {
        const { error } = await supabase.from('shipments').delete().eq('id', data.id)
        if (error) throw error
        return json({ ok: true })
      }
      case 'addTicket': {
        const { error } = await supabase.from('tickets').insert(data)
        if (error) throw error
        return json({ ok: true })
      }
      case 'deleteTicket': {
        const { error } = await supabase.from('tickets').delete().eq('id', data.id)
        if (error) throw error
        return json({ ok: true })
      }
      case 'addMessage': {
        const { error } = await supabase.from('chat_messages').insert(data)
        if (error) throw error
        return json({ ok: true })
      }
      case 'markRead': {
        const { error } = await supabase.from('chat_messages')
          .update({ read_by_admin: true }).eq('shipment_id', data.shipmentId)
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