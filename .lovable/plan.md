
# Multi-Admin RBAC System

This adds a full role-based system (super_admin + admin) on top of the existing app, reusing the project's established pattern: locked-down database tables accessed only through secure edge functions with signed (HMAC) tokens. Passwords are hashed with bcrypt. The current admin (`makoun`) is preserved as a regular admin who can now change their password.

## Approach

Auth stays consistent with the existing custom edge-function model (not Supabase Auth), because the requirements (super admin seeds accounts, auto-generates temporary passwords shown once, deactivate/delete admins) map directly to an admin-managed model rather than email-invite signups.

## Database (new tables, all locked to service_role only)

```
super_admins   id, name, email, password_hash, created_at
admins         id, name, email, phone, company_name, password_hash,
               admin_prefix (UNIQUE), is_active, must_change_password,
               created_at, updated_at
clients        id, admin_id -> admins, client_name, phone, email,
               tracking_code (UNIQUE), shipment_description,
               origin, destination, status, created_at, updated_at
tracking_events id, tracking_code, event_description, location,
               event_time, updated_by_admin_id
```

- A `used_tracking_codes` table (just the code) guarantees codes are never reused even after a client is deleted.
- All tables: no anon/authenticated grants, only `service_role`. RLS enabled with no public policies — access is exclusively via edge functions.

## Seeding

- Super admin seeded: name `jean philippe`, password `superadmin237` (bcrypt-hashed in the seed migration).
- Existing `makoun` admin inserted into `admins` with a generated prefix and their current password hashed.

## Edge functions

- **auth-api** — `login` (checks super_admins then admins by name+password; rejects inactive admins; returns a signed token carrying `{role, id, prefix}`), `changePassword` (requires current password), `logout` is client-side token clear.
- **super-admin-api** (super_admin token only) — list admins with status, create admin (auto-generate prefix from initials + temp password, returned once), delete admin, toggle active, view any admin's clients.
- **admin-space-api** (admin token only) — list own clients (server forces `admin_id` from token), add client (generate globally-unique `PREFIX-XXXXXXXX` code), edit client, update status, delete client, add tracking events.
- **public-api** (extend) — tracking lookup now also resolves `clients.tracking_code`, returning minimal shipment info + public tracking events, never exposing admin identity.

Tracking code generation: `[admin_prefix]-[8 random A–Z0–9]`, checked against `clients` and `used_tracking_codes` with retry until unique, then recorded.

## Frontend pages & routing

- `/login` — single form (name + password), redirects by role.
- `/super-admin/dashboard` — admin table (name, email, created, status) with create/delete/deactivate actions.
- `/super-admin/create-admin` — create form; shows generated temp password once in a copyable dialog.
- `/admin/dashboard` — admin's own clients list + stats.
- `/admin/clients/new` — add client, shows generated tracking code.
- `/admin/clients/:id` — view/edit client, update status, add tracking events.
- `/admin/settings` — change own password (current password required).
- Route guards: a `RoleRoute` wrapper reads the token/role from context; `super_admin` blocked from `/admin/*` and vice versa; logout clears the token.

## Notes / decisions

- The existing public marketing site, i18n, and current `shipments`/`tickets` admin tooling remain untouched; this RBAC system is additive. The legacy `/admin` dashboard keeps working for `makoun`'s existing shipment data; the new client/tracking-code system lives alongside it.
- Currency stays EUR per prior work.
- New admin login uses the same `/login` page; the old `/admin/login` will redirect to `/login`.

## Technical details

- bcrypt via `npm:bcryptjs` in edge functions for hashing/verify.
- Tokens signed with existing `ADMIN_TOKEN_SECRET` (HMAC-SHA256), payload includes role + id + prefix + exp, verified on every protected action.
- A new `AuthContext` stores the token + decoded role/id and exposes `login`, `logout`, `changePassword`, and role-aware API helpers.
