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

function prefixFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  let base = ''
  if (parts.length >= 2) base = (parts[0][0] + parts[1][0])
  else if (parts.length === 1) base = parts[0].slice(0, 2)
  base = base.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (base.length < 2) base = (base + 'XX').slice(0, 2)
  return base
}

async function uniquePrefix(supabase: any, name: string) {
  const base = prefixFromName(name)
  for (let i = 0; i < 30; i++) {
    const candidate = i === 0 ? base : base + randCode(2)
    const { data } = await supabase.from('admins').select('id').eq('admin_prefix', candidate).maybeSingle()
    if (!data) return candidate
  }
  return base + randCode(4)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const claims = await verifyToken(token)
  if (!claims || claims.role !== 'super_admin') return json({ error: 'Unauthorized' }, 401)

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  const { action, data } = payload ?? {}

  try {
    switch (action) {
      case 'listAdmins': {
        const { data: admins, error } = await supabase
          .from('admins')
          .select('id, name, email, phone, company_name, admin_prefix, is_active, created_at, updated_at')
          .order('created_at', { ascending: false })
        if (error) throw error
        return json({ admins: admins ?? [] })
      }
      case 'createAdmin': {
        const name = String(data?.name ?? '').trim()
        const email = String(data?.email ?? '').trim()
        const phone = String(data?.phone ?? '').trim()
        const company = String(data?.companyName ?? '').trim()
        if (!name) return json({ error: 'Name is required' }, 400)
        const prefix = await uniquePrefix(supabase, name)
        const tempPassword = randCode(10)
        const hash = bcrypt.hashSync(tempPassword, 10)
        const { data: created, error } = await supabase.from('admins').insert({
          name, email, phone, company_name: company,
          password_hash: hash, admin_prefix: prefix,
          is_active: true, must_change_password: true,
          created_by_super_admin: claims.id,
        }).select('id, name, admin_prefix').single()
        if (error) throw error
        return json({ ok: true, admin: created, tempPassword })
      }
      case 'toggleActive': {
        const id = String(data?.id ?? '')
        const isActive = Boolean(data?.isActive)
        const { error } = await supabase.from('admins').update({ is_active: isActive }).eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
      case 'deleteAdmin': {
        const id = String(data?.id ?? '')
        const { error } = await supabase.from('admins').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
      case 'adminClients': {
        const id = String(data?.id ?? '')
        const { data: clients, error } = await supabase
          .from('clients').select('*').eq('admin_id', id).order('created_at', { ascending: false })
        if (error) throw error
        return json({ clients: clients ?? [] })
      }
      default:
        return json({ error: 'Unknown action' }, 400)
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})