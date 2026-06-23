-- =========================================================
-- Secure lockdown of shipments, tickets, chat_messages
-- Removes all public/anon access. Access now flows only through
-- service_role (used by authenticated edge functions).
-- =========================================================

-- 1. Drop all existing permissive ("always true") policies
DROP POLICY IF EXISTS "Anyone can delete shipments" ON public.shipments;
DROP POLICY IF EXISTS "Anyone can insert shipments" ON public.shipments;
DROP POLICY IF EXISTS "Anyone can update shipments" ON public.shipments;
DROP POLICY IF EXISTS "Anyone can view shipments" ON public.shipments;

DROP POLICY IF EXISTS "Anyone can send chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;

DROP POLICY IF EXISTS "Anyone can delete tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anyone can insert tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anyone can update tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anyone can view tickets" ON public.tickets;

-- 2. Ensure RLS stays enabled (deny-by-default now that policies are gone)
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 3. Revoke direct Data-API privileges from anon & authenticated.
--    Only service_role (edge functions) may touch the data.
REVOKE ALL ON public.shipments FROM anon, authenticated;
REVOKE ALL ON public.chat_messages FROM anon, authenticated;
REVOKE ALL ON public.tickets FROM anon, authenticated;

GRANT ALL ON public.shipments TO service_role;
GRANT ALL ON public.chat_messages TO service_role;
GRANT ALL ON public.tickets TO service_role;

-- 4. Remove the two tables from the public realtime broadcast so
--    anonymous subscribers can no longer receive live row updates.
ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.tickets;