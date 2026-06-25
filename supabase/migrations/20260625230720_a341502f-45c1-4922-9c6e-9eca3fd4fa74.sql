CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  subscriber_type text NOT NULL,
  admin_id uuid,
  tracking_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
-- No policies: locked down. Only edge functions (service_role) access this table.

CREATE INDEX idx_push_subscriptions_admin ON public.push_subscriptions(admin_id);
CREATE INDEX idx_push_subscriptions_tracking ON public.push_subscriptions(tracking_code);