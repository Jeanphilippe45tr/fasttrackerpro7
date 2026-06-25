import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SECRET = Deno.env.get('ADMIN_TOKEN_SECRET')!
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!
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
  } catch { return null }
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
  try { payload = await req.json() } catch { return json({ error: 'Invalid JSON body' }, 400) }
  const { action, data } = payload ?? {}

  if (action === 'getPublicKey') {
    return json({ publicKey: VAPID_PUBLIC })
  }

  if (action === 'subscribe') {
    const sub = data?.subscription
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return json({ error: 'Invalid subscription' }, 400)
    }
    const subscriberType = data?.subscriberType === 'admin' ? 'admin' : 'client'
    let adminId: string | null = null
    let trackingCode: string | null = null

    if (subscriberType === 'admin') {
      const authHeader = req.headers.get('Authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
      const claims = await verifyToken(token)
      if (!claims || claims.role !== 'admin') return json({ error: 'Unauthorized' }, 401)
      adminId = (claims.id as string) ?? null
    } else {
      trackingCode = String(data?.trackingCode ?? '').trim()
      if (!trackingCode) return json({ error: 'trackingCode required' }, 400)
      const { data: c } = await supabase.from('clients').select('id').ilike('tracking_code', trackingCode).maybeSingle()
      const { data: s } = c ? { data: null } : await supabase.from('shipments').select('id').ilike('tracking_number', trackingCode).maybeSingle()
      if (!c && !s) return json({ error: 'not_found' }, 404)
    }

    // Upsert by endpoint (replace stale ownership).
    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
    const { error } = await supabase.from('push_subscriptions').insert({
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      subscriber_type: subscriberType,
      admin_id: adminId,
      tracking_code: trackingCode,
    })
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true })
  }

  if (action === 'unsubscribe') {
    const endpoint = String(data?.endpoint ?? '')
    if (endpoint) await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
    return json({ ok: true })
  }

  return json({ error: 'Unknown action' }, 400)
})
