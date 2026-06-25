
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ super_admins ============
CREATE TABLE public.super_admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.super_admins TO service_role;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- ============ admins ============
CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  company_name text DEFAULT '',
  password_hash text NOT NULL,
  admin_prefix text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  must_change_password boolean NOT NULL DEFAULT true,
  created_by_super_admin uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admins TO service_role;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- ============ clients ============
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  phone text DEFAULT '',
  email text DEFAULT '',
  tracking_code text NOT NULL UNIQUE,
  shipment_description text DEFAULT '',
  origin text DEFAULT '',
  destination text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- ============ tracking_events ============
CREATE TABLE public.tracking_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code text NOT NULL,
  event_description text NOT NULL DEFAULT '',
  location text DEFAULT '',
  event_time timestamptz NOT NULL DEFAULT now(),
  updated_by_admin_id uuid
);
GRANT ALL ON public.tracking_events TO service_role;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- ============ used_tracking_codes ============
CREATE TABLE public.used_tracking_codes (
  code text NOT NULL PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.used_tracking_codes TO service_role;
ALTER TABLE public.used_tracking_codes ENABLE ROW LEVEL SECURITY;

-- ============ updated_at triggers ============
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ seed super admin ============
INSERT INTO public.super_admins (name, email, password_hash)
VALUES ('jean philippe', 'jeanphilippe@eurotransit.eu', crypt('superadmin237', gen_salt('bf')));

-- ============ migrate existing makoun admin ============
INSERT INTO public.admins (name, email, admin_prefix, password_hash, is_active, must_change_password)
VALUES ('makoun', 'makoun@eurotransit.eu', 'MK', crypt('makountracking237', gen_salt('bf')), true, false);
