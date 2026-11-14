ALTER TABLE public.clients
 ADD COLUMN IF NOT EXISTS sender_name text DEFAULT '',
 ADD COLUMN IF NOT EXISTS sender_phone text DEFAULT '',
 ADD COLUMN IF NOT EXISTS sender_email text DEFAULT '',
 ADD COLUMN IF NOT EXISTS sender_address text DEFAULT '',
 ADD COLUMN IF NOT EXISTS receiver_address text DEFAULT '',
 ADD COLUMN IF NOT EXISTS package_weight text DEFAULT '',
 ADD COLUMN IF NOT EXISTS package_dimensions text DEFAULT '',
 ADD COLUMN IF NOT EXISTS package_type text DEFAULT '',
 ADD COLUMN IF NOT EXISTS package_quantity text DEFAULT '',
 ADD COLUMN IF NOT EXISTS declared_value text DEFAULT '',
 ADD COLUMN IF NOT EXISTS package_contents text DEFAULT '',
 ADD COLUMN IF NOT EXISTS special_instructions text DEFAULT '';