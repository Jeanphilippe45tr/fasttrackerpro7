import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import bcrypt from 'npm:bcryptjs@2.4.3'

const SECRET = Deno.env.get('ADMIN_TOKEN_SECRET')!
const enc = new TextEncoder()

async function hmac(body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function createToken(payload: Record<string, unknown>): Promise<string> {
  const full = { ...payload, exp: Date.now() + 1000 * 60 * 60 * 12 }
  const body = btoa(JSON.stringify(full))
  return `${body}.${await hmac(body)}`
}

async function verifyToken(token: string | null): Promise<any | null> {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = await hmac(body)
  if (expected !== sig) return null
  try {
    const payload = JSON.parse(atob(body))
    if (typeof payload.exp === 'number' && payload.exp > Date.now()) return payload
    return null
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

  try {
    if (action === 'login') {
      const username = String(data?.username ?? '').trim()
      const password = String(data?.password ?? '')
      if (!username || !password) return json({ error: 'Missing credentials' }, 400)

      // 1) super admin (match by name, case-insensitive)
      const { data: sa } = await supabase
        .from('super_admins').select('*').ilike('name', username).maybeSingle()
      if (sa && bcrypt.compareSync(password, sa.password_hash)) {
        const token = await createToken({ role: 'super_admin', id: sa.id, name: sa.name })
        return json({ token, role: 'super_admin', name: sa.name, id: sa.id })
      }

      // 2) regular admin
      const { data: ad } = await supabase
        .from('admins').select('*').ilike('name', username).maybeSingle()
      if (ad && bcrypt.compareSync(password, ad.password_hash)) {
        if (!ad.is_active) return json({ error: 'Account deactivated. Contact the super admin.' }, 403)
        const token = await createToken({ role: 'admin', id: ad.id, name: ad.name, prefix: ad.admin_prefix })
        return json({
          token, role: 'admin', name: ad.name, id: ad.id,
          prefix: ad.admin_prefix, mustChangePassword: ad.must_change_password,
        })
      }

      return json({ error: 'Invalid credentials' }, 401)
    }

    if (action === 'changePassword') {
      const authHeader = req.headers.get('Authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
      const claims = await verifyToken(token)
      if (!claims) return json({ error: 'Unauthorized' }, 401)

      const current = String(data?.currentPassword ?? '')
      const next = String(data?.newPassword ?? '')
      if (next.length < 6) return json({ error: 'New password must be at least 6 characters' }, 400)

      const table = claims.role === 'super_admin' ? 'super_admins' : 'admins'
      const { data: row } = await supabase.from(table).select('*').eq('id', claims.id).maybeSingle()
      if (!row || !bcrypt.compareSync(current, row.password_hash)) {
        return json({ error: 'Current password is incorrect' }, 401)
      }
      const newHash = bcrypt.hashSync(next, 10)
      const updates: Record<string, unknown> = { password_hash: newHash }
      if (table === 'admins') updates.must_change_password = false
      const { error } = await supabase.from(table).update(updates).eq('id', claims.id)
      if (error) throw error
      return json({ ok: true })
    }

    return json({ error: 'Unknown action' }, 400)
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})