-- ============================================================================
-- OpDesk — Database fixes
-- Run this whole file once in the Supabase SQL Editor (Project → SQL Editor).
-- It is written to be safe to re-run (idempotent): existing triggers/policies
-- are dropped and recreated rather than erroring out on conflict.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. TABLE-LEVEL GRANTS
-- ----------------------------------------------------------------------------
-- IMPORTANT: RLS policies only restrict access that the database role already
-- has — they don't grant it. If these tables were created by hand in the SQL
-- editor (rather than through Supabase's table UI, which auto-grants), the
-- `authenticated` role may never have been given INSERT/UPDATE/DELETE rights
-- on them at all. That produces exactly a 403 "permission denied" on insert,
-- regardless of how permissive your RLS policies are. This section makes sure
-- the grants actually exist before the policies below are asked to do their job.

grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;


-- ----------------------------------------------------------------------------
-- 1. FIX YOUR EXISTING ACCOUNT (the one that was stuck on the infinite dashboard)
-- ----------------------------------------------------------------------------
-- Diagnose: run this first to see whether company_id is null.
--
--   select id, email, company_id from public.profiles
--   where id = 'a401452b-7b67-45e5-89c8-393e29af1f0f';
--
-- If company_id is null, create a company and link it (uncomment and edit):
--
--   insert into public.companies (name, operator_type)
--   values ('Your Company Name', 'safari')
--   returning id;
--
--   update public.profiles
--   set company_id = '<paste the id returned above>', role = 'owner'
--   where id = 'a401452b-7b67-45e5-89c8-393e29af1f0f';
--
-- (The Settings page in the app now does this for you automatically the next
-- time you log in and your profile has no company — this manual step is only
-- needed if you'd rather do it directly in SQL right now.)


-- ----------------------------------------------------------------------------
-- 2. AUTO-CREATE A PROFILE ROW FOR EVERY NEW SIGNUP
-- ----------------------------------------------------------------------------
-- This is the root cause of the infinite-loading dashboard: signup only ever
-- created a row in auth.users. Nothing was creating the matching row in
-- public.profiles, so the app's first query for it returned zero rows (a 406)
-- and the dashboard waited forever on data that would never arrive.
--
-- SECURITY DEFINER lets this function bypass RLS on `profiles` so it can
-- insert the row before the user has any permissions of their own yet —
-- otherwise you get a chicken-and-egg problem where the user can't create
-- their own profile because no profile-based policy grants them the right to.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ----------------------------------------------------------------------------
-- 3. HELPER FUNCTIONS FOR ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- Both are SECURITY DEFINER + STABLE so they bypass RLS themselves (avoiding
-- infinite recursion when a `profiles` policy needs to read `profiles`) and so
-- Postgres can cache the result once per statement.

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_superadmin from public.profiles where id = auth.uid()), false);
$$;


-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY — COMPANY-SCOPED TABLES
-- ----------------------------------------------------------------------------
-- Every table below has a company_id column. The same four policies apply to
-- all of them: a user may select/insert/update rows for their own company,
-- and a superadmin can additionally see/delete everything (for the admin
-- dashboard). Looping avoids retyping the same policy 15 times.

do $$
declare
  t text;
  tables text[] := array[
    'staff', 'staff_certifications', 'staff_cost', 'staff_leave',
    'vehicles', 'vessels', 'rooms', 'bookings', 'room_bookings',
    'housekeeping_tasks', 'shifts', 'trails', 'firearm_register',
    'invoices', 'company_addons'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format(
      $f$create policy %I on public.%I for select
         using (company_id = public.current_company_id() or public.is_superadmin())$f$,
      t || '_select', t);

    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format(
      $f$create policy %I on public.%I for insert
         with check (company_id = public.current_company_id())$f$,
      t || '_insert', t);

    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format(
      $f$create policy %I on public.%I for update
         using (company_id = public.current_company_id())
         with check (company_id = public.current_company_id())$f$,
      t || '_update', t);

    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format(
      $f$create policy %I on public.%I for delete
         using (company_id = public.current_company_id() or public.is_superadmin())$f$,
      t || '_delete', t);
  end loop;
end $$;


-- ----------------------------------------------------------------------------
-- 5. COMPANIES
-- ----------------------------------------------------------------------------
alter table public.companies enable row level security;

drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies for select
  using (id = public.current_company_id() or public.is_superadmin());

-- Any signed-in user can create a company (this is how a brand-new signup
-- provisions its own company from the Settings page / signup flow).
drop policy if exists companies_insert on public.companies;
create policy companies_insert on public.companies for insert
  with check (auth.uid() is not null);

-- Only an owner/admin of that company (or a superadmin) can edit it.
drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies for update
  using (
    (id = public.current_company_id() and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('owner', 'admin')
    ))
    or public.is_superadmin()
  )
  with check (id = public.current_company_id() or public.is_superadmin());


-- ----------------------------------------------------------------------------
-- 5b. SELF-SERVICE COMPANY CREATION (RPC)
-- ----------------------------------------------------------------------------
-- Why this exists: a brand-new user has no company_id yet. If the app just
-- does `insert into companies(...).select()`, Postgres has to run the SELECT
-- policy on the row it just inserted in order to hand it back — and at that
-- exact moment current_company_id() is still null, so the row isn't visible
-- yet under companies_select. Postgres reports that as "new row violates row
-- level security policy for table companies", which is exactly the error you
-- hit. This RPC does the insert AND the profile link in one atomic, security
-- definer call that bypasses RLS for just this operation, which is the
-- correct way to handle "let a user create and claim their own org" — the app
-- (AuthContext.js signUp, and the Settings page's first-run flow) now calls
-- this instead of inserting directly.

create or replace function public.create_my_company(
  p_name text, p_operator_type text, p_currency text, p_language text,
  p_country text, p_timezone text, p_billing_email text, p_phone text, p_email text
)
returns public.companies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company public.companies;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid() and company_id is not null) then
    raise exception 'This account is already linked to a company';
  end if;

  insert into public.companies (name, operator_type, currency, language, country, timezone, billing_email, phone, email)
  values (p_name, p_operator_type, p_currency, p_language, p_country, p_timezone, p_billing_email, p_phone, p_email)
  returning * into v_company;

  update public.profiles set company_id = v_company.id, role = 'owner' where id = auth.uid();

  return v_company;
end;
$$;

grant execute on function public.create_my_company(text,text,text,text,text,text,text,text,text) to authenticated;


-- ----------------------------------------------------------------------------
-- 6. PROFILES
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- You can see your own profile, your teammates' profiles, or (superadmin) all.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (
    id = auth.uid()
    or company_id = public.current_company_id()
    or public.is_superadmin()
  );

-- You can only edit your own profile. (Row creation is handled by the
-- on_auth_user_created trigger above, not by direct client inserts.)
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());


-- ----------------------------------------------------------------------------
-- 7. SUPPORT TICKETS
-- ----------------------------------------------------------------------------
-- company_id is nullable here (a ticket can be raised before onboarding is
-- complete), so this table gets its own policies instead of the generic loop.
alter table public.support_tickets enable row level security;

drop policy if exists support_tickets_select on public.support_tickets;
create policy support_tickets_select on public.support_tickets for select
  using (
    submitted_by = auth.uid()
    or company_id = public.current_company_id()
    or public.is_superadmin()
  );

drop policy if exists support_tickets_insert on public.support_tickets;
create policy support_tickets_insert on public.support_tickets for insert
  with check (submitted_by = auth.uid());

drop policy if exists support_tickets_update on public.support_tickets;
create policy support_tickets_update on public.support_tickets for update
  using (public.is_superadmin())
  with check (public.is_superadmin());


-- ----------------------------------------------------------------------------
-- 8. PAYFAST ITN LOG
-- ----------------------------------------------------------------------------
-- This table is written to exclusively by the server-side ITN webhook using
-- the Supabase service role key, which bypasses RLS entirely — so no
-- insert/update policy is defined here on purpose. Clients only get read
-- access to their own company's payment log entries.
alter table public.payfast_itn_log enable row level security;

drop policy if exists payfast_itn_log_select on public.payfast_itn_log;
create policy payfast_itn_log_select on public.payfast_itn_log for select
  using (company_id = public.current_company_id() or public.is_superadmin());


-- ============================================================================
-- Done. Summary of what changed:
--   • New signups now automatically get a `profiles` row (fixes the 406 /
--     infinite-loading dashboard for every future signup, not just this one).
--   • Every table now has Row Level Security enabled and scoped to the
--     logged-in user's own company, with a superadmin override.
--   • See section 1 above to fix the one account that got stuck before this
--     trigger existed.
-- ============================================================================
-- ============================================================================
-- OpDesk — Superadmin panel additions
-- Appends to fixes.sql: new tables, columns, and RPCs needed by the ported
-- superadmin pages (Revenue Overview, Pricing Editor, System Config, Support
-- Queue). Safe to re-run.
-- ============================================================================

-- Pricing tables (managed by the Pricing Editor, read by the public /pricing page)
create table if not exists public.tier_pricing (
  id uuid primary key default gen_random_uuid(),
  tier text unique not null,
  label text not null,
  monthly_price numeric not null default 0,
  annual_price numeric not null default 0,
  updated_at timestamptz default now()
);

create table if not exists public.addon_pricing (
  id uuid primary key default gen_random_uuid(),
  addon_key text unique not null,
  monthly_price numeric not null default 0,
  annual_price numeric not null default 0,
  updated_at timestamptz default now()
);

grant select on public.tier_pricing, public.addon_pricing to anon, authenticated;
grant insert, update, delete on public.tier_pricing, public.addon_pricing to authenticated;

alter table public.tier_pricing enable row level security;
drop policy if exists tier_pricing_select on public.tier_pricing;
create policy tier_pricing_select on public.tier_pricing for select using (true);
drop policy if exists tier_pricing_write on public.tier_pricing;
create policy tier_pricing_write on public.tier_pricing for all
  using (public.is_superadmin()) with check (public.is_superadmin());

alter table public.addon_pricing enable row level security;
drop policy if exists addon_pricing_select on public.addon_pricing;
create policy addon_pricing_select on public.addon_pricing for select using (true);
drop policy if exists addon_pricing_write on public.addon_pricing;
create policy addon_pricing_write on public.addon_pricing for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- Seed defaults (matches the Pricing Editor's "Reset to Defaults" values) —
-- only inserts if the tables are empty, so re-running this doesn't clobber
-- prices you've already customised.
insert into public.tier_pricing (tier, label, monthly_price, annual_price)
select * from (values
  ('free','Free',0,0), ('basic','Basic',349,3490),
  ('standard','Standard',1099,10990), ('premium','Premium',2499,24990)
) as v(tier,label,monthly_price,annual_price)
where not exists (select 1 from public.tier_pricing);

insert into public.addon_pricing (addon_key, monthly_price, annual_price)
select * from (values
  ('vehicles',99,990),('guides',99,990),('drivers',99,990),('shuttles',99,990),
  ('safaris',99,990),('tours',99,990),('charters',99,990),('trails',149,1490),
  ('seats',79,790),('schedules_module',199,1990),('firearm_register',299,2990),
  ('white_label',499,4990),('no_watermark',49,490),
  ('storage_10gb',199,1990),('storage_50gb',499,4990),('storage_200gb',999,9990),
  ('bandwidth_50gb',99,990),('bandwidth_200gb',199,1990),('bandwidth_1tb',499,4990),
  ('client_list',199,1990)
) as v(addon_key,monthly_price,annual_price)
where not exists (select 1 from public.addon_pricing);


-- Company account status (used by Revenue Overview's account-health breakdown)
alter table public.companies add column if not exists account_status text not null default 'active';

-- Admin notes on support tickets (used by the Support Queue detail view)
alter table public.support_tickets add column if not exists admin_notes text;


-- Superadmin RPCs: bypass RLS deliberately (SECURITY DEFINER), but each one
-- checks is_superadmin() itself first and raises if the caller isn't one.
-- (sa_get_all_companies is defined once, further down, with the enhanced
-- signature that includes per-company counts — an earlier duplicate
-- definition here used to exist without a preceding DROP, which broke
-- re-running this script on a database that already had the enhanced
-- version: CREATE OR REPLACE can't silently change a function's return
-- type. Removed to keep this file safe to run repeatedly.)

-- (sa_get_revenue_stats is defined once, further down, with the 5-tier
-- signature — see the note above sa_get_all_companies for why the earlier
-- duplicate definition that used to be here was removed.)
-- ============================================================================
-- OpDesk — Superadmin: Companies management
-- ============================================================================

alter table public.companies add column if not exists admin_notes text;

-- Replaces the earlier sa_get_all_companies with one that also returns
-- per-company counts, so the list page doesn't need N+1 queries.
drop function if exists public.sa_get_all_companies();
create function public.sa_get_all_companies()
returns table (
  id uuid, name text, slug text, email text, phone text, country text, currency text,
  operator_type text, subscription_tier text, subscription_expires_at timestamptz,
  account_status text, active boolean, onboarding_complete boolean, admin_notes text,
  created_at timestamptz, updated_at timestamptz,
  booking_count bigint, user_count bigint, addon_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Not authorised — superadmin role required';
  end if;
  return query
    select c.id, c.name, c.slug, c.email, c.phone, c.country, c.currency,
      c.operator_type, c.subscription_tier, c.subscription_expires_at,
      c.account_status, c.active, c.onboarding_complete, c.admin_notes,
      c.created_at, c.updated_at,
      coalesce(b.cnt,0), coalesce(p.cnt,0), coalesce(a.cnt,0)
    from public.companies c
    left join (select company_id, count(*) cnt from public.bookings group by company_id) b on b.company_id = c.id
    left join (select company_id, count(*) cnt from public.profiles group by company_id) p on p.company_id = c.id
    left join (select company_id, count(*) cnt from public.company_addons ca where ca.active group by company_id) a on a.company_id = c.id
    order by c.created_at desc;
end;
$$;
grant execute on function public.sa_get_all_companies() to authenticated;

-- (sa_update_company is defined once, further down, with the 7-parameter
-- signature that adds p_package_id for Marketing Packages — see the note
-- above sa_get_all_companies for why duplicate definitions like the one
-- that used to be here get removed rather than left in place.)

-- Grant an add-on to a company at any price (0 = free, or any discounted
-- amount) — this is a superadmin override of the public addon_pricing table,
-- so a normal company can't self-grant discounts by calling the same path.
create or replace function public.sa_grant_addon(
  p_company_id uuid,
  p_addon_key text,
  p_quantity int default 1,
  p_price_per_unit numeric default 0,
  p_billing_cycle text default 'monthly',
  p_note text default null
)
returns public.company_addons
language plpgsql security definer set search_path = public
as $$
declare v_row public.company_addons;
begin
  if not public.is_superadmin() then
    raise exception 'Not authorised — superadmin role required';
  end if;
  insert into public.company_addons
    (company_id, addon_key, addon_type, quantity, price_per_unit, billing_cycle, active, note)
  values
    (p_company_id, p_addon_key, p_addon_key, p_quantity, p_price_per_unit, p_billing_cycle, true, p_note)
  returning * into v_row;
  return v_row;
end;
$$;
grant execute on function public.sa_grant_addon(uuid,text,int,numeric,text,text) to authenticated;

create or replace function public.sa_revoke_addon(p_addon_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Not authorised — superadmin role required';
  end if;
  update public.company_addons set active = false where id = p_addon_id;
end;
$$;
grant execute on function public.sa_revoke_addon(uuid) to authenticated;

-- 2FA columns don't exist yet anywhere in this schema (the TOTP login flow
-- itself is still a deferred follow-up) — added here so there's something
-- for this reset action to act on, and so the Users tab can show real status
-- once 2FA ships instead of always reading as "disabled".
alter table public.profiles add column if not exists totp_enabled boolean not null default false;
alter table public.profiles add column if not exists totp_secret text;

create or replace function public.sa_reset_2fa(p_user_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Not authorised — superadmin role required';
  end if;
  update public.profiles set totp_enabled = false, totp_secret = null where id = p_user_id;
end;
$$;
grant execute on function public.sa_reset_2fa(uuid) to authenticated;
-- ============================================================================
-- OpDesk — Security hardening (from Supabase linter warnings)
-- ============================================================================

-- Postgres grants EXECUTE on new functions to PUBLIC by default (which
-- includes both `anon` and `authenticated`), unless explicitly revoked. Our
-- earlier `grant ... to authenticated` calls never revoked the automatic
-- PUBLIC grant, so `anon` (fully signed-out visitors) could technically call
-- these RPCs over the REST API too. Each function already checks
-- auth.uid()/is_superadmin() internally and raises an exception for anyone
-- unauthorized, so this was never actually exploitable — but the linter is
-- right that it shouldn't be reachable by anon at all. Locking it down here.
revoke execute on function public.create_my_company(text,text,text,text,text,text,text,text,text) from public;
revoke execute on function public.current_company_id() from public;
revoke execute on function public.is_superadmin() from public;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.sa_get_all_companies() from public;
-- (sa_get_revenue_stats and sa_update_company are deliberately not
-- revoked/granted here — their only surviving definitions come later in
-- this file, and each already revokes/grants itself right after being
-- defined there.)
revoke execute on function public.sa_grant_addon(uuid,text,int,numeric,text,text) from public;
revoke execute on function public.sa_revoke_addon(uuid) from public;
revoke execute on function public.sa_reset_2fa(uuid) from public;

grant execute on function public.create_my_company(text,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.current_company_id() to authenticated;
grant execute on function public.is_superadmin() to authenticated;
grant execute on function public.sa_get_all_companies() to authenticated;
grant execute on function public.sa_grant_addon(uuid,text,int,numeric,text,text) to authenticated;
grant execute on function public.sa_revoke_addon(uuid) to authenticated;
grant execute on function public.sa_reset_2fa(uuid) to authenticated;
-- handle_new_user is only ever invoked by the auth trigger itself (as the
-- trigger owner), never called directly by a client — no role needs direct
-- EXECUTE on it at all.

-- Pre-existing security-definer view (not something this project's fixes.sql
-- created — this was already in your database). SECURITY DEFINER on a VIEW
-- means it runs with the view creator's permissions rather than the querying
-- user's, silently bypassing RLS on whatever tables it reads from — almost
-- never what you want. Postgres 15+ (which Supabase runs) lets you flip this
-- per-view without recreating it. Wrapped defensively in case this view
-- doesn't exist in a given environment.
do $$
begin
  execute 'alter view public.staff_certifications_with_status set (security_invoker = on)';
exception when undefined_table then
  raise notice 'staff_certifications_with_status view not found — skipping';
end $$;
-- ============================================================================
-- OpDesk — 5-tier pricing (Free / Basic / Standard / Professional / Enterprise)
-- + module entitlement system (Certifications / Shifts / Cost to Company / Leave)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. FIX A PRE-EXISTING DEFAULT MISMATCH
-- ----------------------------------------------------------------------------
-- companies.subscription_tier defaults to 'explorer' at the table level, but
-- every part of the app (tier_pricing, the public pricing page, module
-- gating below) treats the base tier as 'free'. Every brand-new signup has
-- been silently landing on a tier name nothing else recognizes.
update public.companies set subscription_tier = 'free' where subscription_tier = 'explorer';
alter table public.companies alter column subscription_tier set default 'free';


-- ----------------------------------------------------------------------------
-- 1. RENAME "premium" -> "professional", ADD "enterprise"
-- ----------------------------------------------------------------------------
-- Any existing company already on 'premium' needs to move with the rename —
-- do this BEFORE renaming the tier_pricing row, and BEFORE anything else
-- references 'professional' expecting it to already exist.
update public.companies set subscription_tier = 'professional' where subscription_tier = 'premium';

update public.tier_pricing
set tier = 'professional', label = 'Professional'
where tier = 'premium';

insert into public.tier_pricing (tier, label, monthly_price, annual_price)
select 'enterprise', 'Enterprise', 4999, 49990
where not exists (select 1 from public.tier_pricing where tier = 'enterprise');


-- ----------------------------------------------------------------------------
-- 2. New add-on types for the 4 modules that are now gated
-- ----------------------------------------------------------------------------
insert into public.addon_pricing (addon_key, monthly_price, annual_price)
select * from (values
  ('certifications', 149, 1490),
  ('shifts', 149, 1490),
  ('cost_to_company', 249, 2490),
  ('leave', 99, 990)
) as v(addon_key, monthly_price, annual_price)
where not exists (select 1 from public.addon_pricing where addon_key = v.addon_key);


-- ----------------------------------------------------------------------------
-- 3. sa_get_revenue_stats — extend to 5 tiers (professional + enterprise
--    replace the old single premium_count column)
-- ----------------------------------------------------------------------------
drop function if exists public.sa_get_revenue_stats();
create function public.sa_get_revenue_stats()
returns table(
  month text, new_companies bigint, basic_count bigint,
  standard_count bigint, professional_count bigint, enterprise_count bigint,
  mrr_zar numeric
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Not authorised — superadmin role required';
  end if;
  return query
    select
      to_char(date_trunc('month', c.created_at), 'Mon YYYY'),
      count(*),
      count(*) filter (where c.subscription_tier = 'basic'),
      count(*) filter (where c.subscription_tier = 'standard'),
      count(*) filter (where c.subscription_tier = 'professional'),
      count(*) filter (where c.subscription_tier = 'enterprise'),
      sum(case c.subscription_tier
            when 'basic' then 349::numeric when 'standard' then 1099::numeric
            when 'professional' then 2499::numeric when 'enterprise' then 4999::numeric
            else 0::numeric end)
    from public.companies c
    group by date_trunc('month', c.created_at)
    order by date_trunc('month', c.created_at) desc;
end;
$$;
revoke execute on function public.sa_get_revenue_stats() from public;
grant execute on function public.sa_get_revenue_stats() to authenticated;
-- ============================================================================
-- OpDesk — Marketing Packages (superadmin-managed, drives the public
-- pricing page AND actual company entitlements — single source of truth)
-- ============================================================================

create table if not exists public.marketing_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  tagline text,
  description text,
  monthly_price numeric not null default 0,
  annual_price numeric not null default 0,
  currency text not null default 'ZAR',
  badge text,                                   -- e.g. 'Most Popular', null = no badge
  recommended_for text[] default '{}',           -- e.g. {safari,lodge} — marketing tags only, never restricts purchase
  limits jsonb not null default '{}'::jsonb,     -- resource caps, e.g. {"vehicles":3,"guides":3,"bookings_per_month":null}
  modules jsonb not null default '{}'::jsonb,    -- gated module flags, e.g. {"certifications":true,"shifts":true,"costs":false,"leave":true}
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

grant select on public.marketing_packages to anon, authenticated;
grant insert, update, delete on public.marketing_packages to authenticated;

alter table public.marketing_packages enable row level security;
drop policy if exists marketing_packages_select on public.marketing_packages;
create policy marketing_packages_select on public.marketing_packages for select using (true);
drop policy if exists marketing_packages_write on public.marketing_packages;
create policy marketing_packages_write on public.marketing_packages for all
  using (public.is_superadmin()) with check (public.is_superadmin());


-- Link companies to a package. Kept alongside subscription_tier (not
-- replacing it) so every existing display that reads subscription_tier as a
-- text label keeps working — a trigger keeps that label in sync whenever
-- package_id changes, so it never drifts out of step with the real package.
alter table public.companies add column if not exists package_id uuid references public.marketing_packages(id);

create or replace function public.sync_company_tier_label()
returns trigger language plpgsql as $$
begin
  if new.package_id is distinct from old.package_id and new.package_id is not null then
    select slug into new.subscription_tier from public.marketing_packages where id = new.package_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_company_tier on public.companies;
create trigger trg_sync_company_tier
  before update on public.companies
  for each row execute function public.sync_company_tier_label();


-- Seed the 5 default packages (same structure/pricing as the tier system,
-- now fully editable). recommended_for is a marketing tag only — every
-- package is purchasable by every vertical, including Lodging, which was
-- the actual gap: Lodging was always on the same universal ladder as Safari
-- and Shuttle, it just had no editable package record backing it before now.
insert into public.marketing_packages (name, slug, tagline, monthly_price, annual_price, badge, recommended_for, limits, modules, sort_order)
select * from (values
  ('Free', 'free', 'Try it out, no card needed', 0, 0, null,
   ARRAY[]::text[], '{"vehicles":1,"guides":1,"bookings_per_month":20}'::jsonb,
   '{"certifications":false,"shifts":false,"costs":false,"leave":false}'::jsonb, 1),
  ('Basic', 'basic', 'For solo operators getting started', 349, 3490, null,
   ARRAY[]::text[], '{"vehicles":3,"guides":3,"bookings_per_month":null}'::jsonb,
   '{"certifications":false,"shifts":false,"costs":false,"leave":false}'::jsonb, 2),
  ('Standard', 'standard', 'For growing teams', 1099, 10990, 'Most Popular',
   ARRAY[]::text[], '{"vehicles":10,"guides":10,"bookings_per_month":null}'::jsonb,
   '{"certifications":false,"shifts":true,"costs":false,"leave":true}'::jsonb, 3),
  ('Professional', 'professional', 'For established operators', 2499, 24990, null,
   ARRAY[]::text[], '{"vehicles":null,"guides":null,"bookings_per_month":null}'::jsonb,
   '{"certifications":true,"shifts":true,"costs":false,"leave":true}'::jsonb, 4),
  ('Enterprise', 'enterprise', 'For multi-site & large operations', 4999, 49990, null,
   ARRAY[]::text[], '{"vehicles":null,"guides":null,"bookings_per_month":null}'::jsonb,
   '{"certifications":true,"shifts":true,"costs":true,"leave":true}'::jsonb, 5)
) as v(name,slug,tagline,monthly_price,annual_price,badge,recommended_for,limits,modules,sort_order)
where not exists (select 1 from public.marketing_packages);

-- Backfill existing companies onto the matching package by their current
-- subscription_tier text, so nobody's entitlements change during cutover.
update public.companies c
set package_id = mp.id
from public.marketing_packages mp
where c.package_id is null and mp.slug = c.subscription_tier;


-- Superadmin: assign a package to a company (extends sa_update_company)
drop function if exists public.sa_update_company(uuid,text,timestamptz,text,text,boolean);
drop function if exists public.sa_update_company(uuid,text,timestamptz,text,text,boolean,uuid);
create function public.sa_update_company(
  p_company_id uuid,
  p_subscription_tier text default null,
  p_subscription_expires_at timestamptz default null,
  p_account_status text default null,
  p_admin_notes text default null,
  p_active boolean default null,
  p_package_id uuid default null
)
returns public.companies
language plpgsql security definer set search_path = public
as $$
declare v_company public.companies;
begin
  if not public.is_superadmin() then
    raise exception 'Not authorised — superadmin role required';
  end if;
  update public.companies set
    subscription_tier = coalesce(p_subscription_tier, subscription_tier),
    subscription_expires_at = coalesce(p_subscription_expires_at, subscription_expires_at),
    account_status = coalesce(p_account_status, account_status),
    admin_notes = coalesce(p_admin_notes, admin_notes),
    active = coalesce(p_active, active),
    package_id = coalesce(p_package_id, package_id),
    updated_at = now()
  where id = p_company_id
  returning * into v_company;
  return v_company;
end;
$$;
revoke execute on function public.sa_update_company(uuid,text,timestamptz,text,text,boolean,uuid) from public;
grant execute on function public.sa_update_company(uuid,text,timestamptz,text,text,boolean,uuid) to authenticated;


-- Self-service add-on requests (real self-checkout needs a payment
-- provider, which isn't wired up in this rebuild yet — this gives logged-in
-- users a genuine "browse & request" flow, and superadmin fulfils requests
-- through the Companies panel's existing grant-addon tool).
create table if not exists public.addon_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  requested_by uuid references public.profiles(id),
  addon_key text not null,
  quantity int not null default 1,
  status text not null default 'pending',  -- pending | approved | declined
  note text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

alter table public.addon_requests enable row level security;

drop policy if exists addon_requests_select on public.addon_requests;
create policy addon_requests_select on public.addon_requests for select
  using (company_id = public.current_company_id() or public.is_superadmin());

drop policy if exists addon_requests_insert on public.addon_requests;
create policy addon_requests_insert on public.addon_requests for insert
  with check (company_id = public.current_company_id());

drop policy if exists addon_requests_update on public.addon_requests;
create policy addon_requests_update on public.addon_requests for update
  using (public.is_superadmin()) with check (public.is_superadmin());

grant select, insert on public.addon_requests to authenticated;
grant update on public.addon_requests to authenticated;
-- ============================================================================
-- OpDesk — Audit fixes (Marketing Packages review pass)
-- ============================================================================

-- Remove the redundant 'shifts' add-on SKU — 'schedules_module' already
-- existed and represents the same feature. Having both was a real bug: a
-- customer buying 'schedules_module' (the one that pre-existed and was
-- already visible everywhere) wouldn't actually have unlocked the Shifts
-- module, because the gating check was looking for 'shifts' specifically.
delete from public.addon_pricing where addon_key = 'shifts';

-- Any company that was (incorrectly) granted the now-removed 'shifts' addon
-- gets migrated onto 'schedules_module' instead, so nobody loses access.
update public.company_addons set addon_key = 'schedules_module' where addon_key = 'shifts';
-- Extend sa_get_all_companies to return the linked package's live monthly
-- price directly, so the Companies list page's MRR total reflects whatever
-- superadmin last set in Marketing Packages — not the disconnected legacy
-- tier_pricing table.
drop function if exists public.sa_get_all_companies();
create function public.sa_get_all_companies()
returns table (
  id uuid, name text, slug text, email text, phone text, country text, currency text,
  operator_type text, subscription_tier text, subscription_expires_at timestamptz,
  account_status text, active boolean, onboarding_complete boolean, admin_notes text,
  created_at timestamptz, updated_at timestamptz,
  booking_count bigint, user_count bigint, addon_count bigint,
  package_id uuid, package_name text, package_monthly_price numeric
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Not authorised — superadmin role required';
  end if;
  return query
    select c.id, c.name, c.slug, c.email, c.phone, c.country, c.currency,
      c.operator_type, c.subscription_tier, c.subscription_expires_at,
      c.account_status, c.active, c.onboarding_complete, c.admin_notes,
      c.created_at, c.updated_at,
      coalesce(b.cnt,0), coalesce(p.cnt,0), coalesce(ca.cnt,0),
      mp.id, mp.name, mp.monthly_price
    from public.companies c
    left join (select company_id, count(*) cnt from public.bookings group by company_id) b on b.company_id = c.id
    left join (select company_id, count(*) cnt from public.profiles group by company_id) p on p.company_id = c.id
    left join (select company_id, count(*) cnt from public.company_addons ca where ca.active group by company_id) ca on ca.company_id = c.id
    left join public.marketing_packages mp on mp.id = c.package_id
    order by c.created_at desc;
end;
$$;
revoke execute on function public.sa_get_all_companies() from public;
grant execute on function public.sa_get_all_companies() to authenticated;
-- ============================================================================
-- OpDesk — Packages v3: room limits, HR Bundle add-on
-- ============================================================================

-- Lodging operators care about room capacity, not vehicle capacity — add
-- 'rooms' alongside the existing vehicles/guides/bookings_per_month limits.
-- Existing packages get a sensible default matching their vehicle limit
-- (same tier scale), since these are structurally equivalent resources.
update public.marketing_packages
set limits = limits || jsonb_build_object('rooms', limits->'vehicles')
where not (limits ? 'rooms');

-- HR Bundle: buying certifications + shifts + cost-to-company + leave
-- individually costs 149+199+249+99 = 696/mo. Bundled at a real discount.
insert into public.addon_pricing (addon_key, monthly_price, annual_price)
select 'hr_bundle', 499, 4990
where not exists (select 1 from public.addon_pricing where addon_key = 'hr_bundle');
-- ============================================================================
-- OpDesk — Lodging packages, room add-ons, campsite room types
-- ============================================================================

-- Extra room capacity, purchasable the same way as extra vehicles/guides —
-- this was the actual gap: there was no addon at all for rooms.
insert into public.addon_pricing (addon_key, monthly_price, annual_price)
select 'rooms', 79, 790
where not exists (select 1 from public.addon_pricing where addon_key = 'rooms');

-- 5 Lodging-focused packages, same ladder structure and HR-module gating as
-- the generic ones, but tuned for hospitality (rooms-first, minimal vehicle
-- emphasis) and tagged so they show under a "Lodging" filter on /pricing.
insert into public.marketing_packages (name, slug, tagline, monthly_price, annual_price, badge, recommended_for, limits, modules, sort_order)
select * from (values
  ('Lodge Free', 'lodge-free', 'Try it out — perfect for a single guesthouse', 0, 0, null,
   ARRAY['lodge'], '{"rooms":3,"guides":0,"vehicles":0,"bookings_per_month":20}'::jsonb,
   '{"certifications":false,"shifts":false,"costs":false,"leave":false}'::jsonb, 10),
  ('Lodge Basic', 'lodge-basic', 'For small guesthouses and B&Bs', 299, 2990, null,
   ARRAY['lodge'], '{"rooms":10,"guides":2,"vehicles":1,"bookings_per_month":null}'::jsonb,
   '{"certifications":false,"shifts":false,"costs":false,"leave":false}'::jsonb, 11),
  ('Lodge Standard', 'lodge-standard', 'For growing lodges and rest camps', 999, 9990, 'Most Popular',
   ARRAY['lodge'], '{"rooms":30,"guides":5,"vehicles":3,"bookings_per_month":null}'::jsonb,
   '{"certifications":false,"shifts":true,"costs":false,"leave":true}'::jsonb, 12),
  ('Lodge Professional', 'lodge-professional', 'For established multi-room properties', 2299, 22990, null,
   ARRAY['lodge'], '{"rooms":null,"guides":null,"vehicles":10,"bookings_per_month":null}'::jsonb,
   '{"certifications":true,"shifts":true,"costs":false,"leave":true}'::jsonb, 13),
  ('Lodge Enterprise', 'lodge-enterprise', 'For multi-property hospitality groups', 4599, 45990, null,
   ARRAY['lodge'], '{"rooms":null,"guides":null,"vehicles":null,"bookings_per_month":null}'::jsonb,
   '{"certifications":true,"shifts":true,"costs":true,"leave":true}'::jsonb, 14)
) as v(name,slug,tagline,monthly_price,annual_price,badge,recommended_for,limits,modules,sort_order)
where not exists (select 1 from public.marketing_packages where slug = v.slug);

-- Tag the existing generic packages as relevant to the non-lodging verticals
-- they were originally built around, so the /pricing vertical filter has
-- something sensible to show for "Safari", "Shuttle" etc. too.
update public.marketing_packages
set recommended_for = ARRAY['safari','shuttle','fishing','yacht','trail','eastafrica','transfer']
where slug in ('free','basic','standard','professional','enterprise') and recommended_for = '{}';
-- ============================================================================
-- OpDesk — Lodging packages v2: room-count ladder (1/5/20/50/unlimited)
-- with HR module gating mirroring the generic operator tiers
-- ============================================================================

update public.marketing_packages set
  tagline = 'A single Airbnb listing or homestay room — try it free',
  monthly_price = 0, annual_price = 0,
  limits = '{"rooms":1,"guides":0,"vehicles":0,"bookings_per_month":20}'::jsonb,
  modules = '{"certifications":false,"shifts":false,"costs":false,"leave":false}'::jsonb
where slug = 'lodge-free';

update public.marketing_packages set
  tagline = 'Small B&Bs, guesthouses, and multi-listing Airbnb hosts',
  monthly_price = 299, annual_price = 2990,
  limits = '{"rooms":5,"guides":2,"vehicles":1,"bookings_per_month":null}'::jsonb,
  modules = '{"certifications":false,"shifts":false,"costs":false,"leave":false}'::jsonb
where slug = 'lodge-basic';

update public.marketing_packages set
  tagline = 'Lodges, camps, and mid-size hotels',
  monthly_price = 999, annual_price = 9990, badge = 'Most Popular',
  limits = '{"rooms":20,"guides":5,"vehicles":2,"bookings_per_month":null}'::jsonb,
  modules = '{"certifications":false,"shifts":true,"costs":false,"leave":true}'::jsonb
where slug = 'lodge-standard';

update public.marketing_packages set
  tagline = 'Larger lodges, hotels, and multi-building properties',
  monthly_price = 2299, annual_price = 22990,
  limits = '{"rooms":50,"guides":10,"vehicles":5,"bookings_per_month":null}'::jsonb,
  modules = '{"certifications":true,"shifts":true,"costs":false,"leave":true}'::jsonb
where slug = 'lodge-professional';

update public.marketing_packages set
  tagline = 'Hotel groups, resorts, and multi-property operators',
  monthly_price = 4599, annual_price = 45990,
  limits = '{"rooms":null,"guides":null,"vehicles":null,"bookings_per_month":null}'::jsonb,
  modules = '{"certifications":true,"shifts":true,"costs":true,"leave":true}'::jsonb
where slug = 'lodge-enterprise';
-- ============================================================================
-- OpDesk — Quotations
-- ============================================================================

-- Quotations reuse the existing `invoices` table (invoice_type='quotation')
-- rather than a new table — same line-item/subtotal/VAT/total shape, same
-- currency handling, same RLS already in place. Only new thing they need
-- that a normal invoice doesn't: an expiry date on the quoted price.
alter table public.invoices add column if not exists valid_until date;

-- Purchasable individually (same pattern as certifications/shifts/leave),
-- for a company on a tier that doesn't include it by default.
insert into public.addon_pricing (addon_key, monthly_price, annual_price)
select 'quotations', 99, 990
where not exists (select 1 from public.addon_pricing where addon_key = 'quotations');

-- Add quotations to every existing package's included-modules per the tier
-- rule (Basic and up, not Free) — mirrors TIER_INCLUDED_MODULES in the app.
update public.marketing_packages
set modules = modules || jsonb_build_object('quotations', true)
where slug not in ('free', 'lodge-free');

update public.marketing_packages
set modules = modules || jsonb_build_object('quotations', false)
where slug in ('free', 'lodge-free');
-- ============================================================================
-- OpDesk — RollingRover Web Services (a separate business the platform
-- owner runs through the same app) + 30-day trials for paid packages
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Trial tracking on companies
-- ----------------------------------------------------------------------------
alter table public.companies add column if not exists trial_ends_at timestamptz;

-- ----------------------------------------------------------------------------
-- 2. RollingRover Web Services — its own tables, deliberately NOT part of
-- the `companies` tenant model. This is the platform owner's own business,
-- not a tourism operator customer, so it stays out of the multi-tenant data
-- model entirely and lives as a superadmin-only ledger.
-- ----------------------------------------------------------------------------
create table if not exists public.rollingrover_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  business_name text,
  project_type text,            -- new_website | redesign | ecommerce | landing_page | web_app
  page_count text,              -- '1-5' | '6-10' | '10+' etc, free-form small string
  ecommerce boolean default false,
  features text[] default '{}', -- selected feature checkboxes
  timeline text,
  budget_range text,
  details text,                 -- free-text project description
  status text not null default 'new',   -- new | quoted | paid | declined | archived
  quote_amount numeric,
  quote_notes text,
  currency text not null default 'ZAR',
  billing_type text not null default 'one_off',  -- one_off | recurring
  recurring_cadence text,       -- monthly | annual (only when billing_type = recurring)
  next_due_date date,           -- for recurring items: when to send the next payment link
  payment_link text,
  payfast_m_payment_id text,    -- our own reference, used to match the ITN callback
  payfast_pf_payment_id text,   -- PayFast's own payment id, filled in once paid
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Public lead-capture form — anyone can submit a request without being
-- logged in, same as any "contact us" / "get a quote" form. Only the
-- superadmin can read or act on submissions.
grant insert on public.rollingrover_requests to anon, authenticated;
grant select, update on public.rollingrover_requests to authenticated;

alter table public.rollingrover_requests enable row level security;

drop policy if exists rollingrover_requests_insert on public.rollingrover_requests;
create policy rollingrover_requests_insert on public.rollingrover_requests for insert
  with check (true);

drop policy if exists rollingrover_requests_select on public.rollingrover_requests;
create policy rollingrover_requests_select on public.rollingrover_requests for select
  using (public.is_superadmin());

drop policy if exists rollingrover_requests_update on public.rollingrover_requests;
create policy rollingrover_requests_update on public.rollingrover_requests for update
  using (public.is_superadmin()) with check (public.is_superadmin());


-- ----------------------------------------------------------------------------
-- 3. Extend sa_update_company with trial tracking (single, final signature —
-- this function has been extended before; see the notes elsewhere in this
-- file about why duplicate/mismatched definitions broke idempotent re-runs
-- in earlier versions of this script. Dropping every prior signature this
-- function has ever had before recreating it, so this stays safe regardless
-- of which version is currently in the database.)
-- ----------------------------------------------------------------------------
drop function if exists public.sa_update_company(uuid,text,timestamptz,text,text,boolean);
drop function if exists public.sa_update_company(uuid,text,timestamptz,text,text,boolean,uuid);
drop function if exists public.sa_update_company(uuid,text,timestamptz,text,text,boolean,uuid,timestamptz);
create function public.sa_update_company(
  p_company_id uuid,
  p_subscription_tier text default null,
  p_subscription_expires_at timestamptz default null,
  p_account_status text default null,
  p_admin_notes text default null,
  p_active boolean default null,
  p_package_id uuid default null,
  p_trial_ends_at timestamptz default null
)
returns public.companies
language plpgsql security definer set search_path = public
as $$
declare v_company public.companies;
begin
  if not public.is_superadmin() then
    raise exception 'Not authorised — superadmin role required';
  end if;
  update public.companies set
    subscription_tier = coalesce(p_subscription_tier, subscription_tier),
    subscription_expires_at = coalesce(p_subscription_expires_at, subscription_expires_at),
    account_status = coalesce(p_account_status, account_status),
    admin_notes = coalesce(p_admin_notes, admin_notes),
    active = coalesce(p_active, active),
    package_id = coalesce(p_package_id, package_id),
    trial_ends_at = coalesce(p_trial_ends_at, trial_ends_at),
    updated_at = now()
  where id = p_company_id
  returning * into v_company;
  return v_company;
end;
$$;
revoke execute on function public.sa_update_company(uuid,text,timestamptz,text,text,boolean,uuid,timestamptz) from public;
grant execute on function public.sa_update_company(uuid,text,timestamptz,text,text,boolean,uuid,timestamptz) to authenticated;
-- Extend sa_get_all_companies with trial_ends_at so the Companies list can
-- flag "needs follow-up" without opening each company individually.
drop function if exists public.sa_get_all_companies();
create function public.sa_get_all_companies()
returns table (
  id uuid, name text, slug text, email text, phone text, country text, currency text,
  operator_type text, subscription_tier text, subscription_expires_at timestamptz,
  account_status text, active boolean, onboarding_complete boolean, admin_notes text,
  created_at timestamptz, updated_at timestamptz,
  booking_count bigint, user_count bigint, addon_count bigint,
  package_id uuid, package_name text, package_monthly_price numeric,
  trial_ends_at timestamptz
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Not authorised — superadmin role required';
  end if;
  return query
    select c.id, c.name, c.slug, c.email, c.phone, c.country, c.currency,
      c.operator_type, c.subscription_tier, c.subscription_expires_at,
      c.account_status, c.active, c.onboarding_complete, c.admin_notes,
      c.created_at, c.updated_at,
      coalesce(b.cnt,0), coalesce(p.cnt,0), coalesce(ca.cnt,0),
      mp.id, mp.name, mp.monthly_price,
      c.trial_ends_at
    from public.companies c
    left join (select company_id, count(*) cnt from public.bookings group by company_id) b on b.company_id = c.id
    left join (select company_id, count(*) cnt from public.profiles group by company_id) p on p.company_id = c.id
    left join (select company_id, count(*) cnt from public.company_addons ca where ca.active group by company_id) ca on ca.company_id = c.id
    left join public.marketing_packages mp on mp.id = c.package_id
    order by c.created_at desc;
end;
$$;
revoke execute on function public.sa_get_all_companies() from public;
grant execute on function public.sa_get_all_companies() to authenticated;
-- ============================================================================
-- OpDesk — Automated recurring PayFast billing for SaaS subscriptions
-- ============================================================================

-- payfast_token: the token PayFast issues once a recurring subscription is
-- set up — needed to match future automatic recurring-charge ITNs back to
-- this company (PayFast identifies re-bills by token, not by our original
-- m_payment_id, which is only reliably unique for the *first* transaction).
alter table public.companies add column if not exists payfast_token text;

-- Every confirmed SaaS subscription payment (initial + every recurring
-- re-bill), for the same "all income traceable" reason the RollingRover
-- ledger exists — this is the SaaS side of that same goal.
create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  package_id uuid references public.marketing_packages(id),
  amount numeric not null,
  currency text not null default 'ZAR',
  payfast_m_payment_id text,
  payfast_pf_payment_id text,
  payfast_token text,
  payment_status text,
  is_initial_setup boolean not null default false,  -- true = trial/subscription setup, not a real charge
  billing_date date,
  created_at timestamptz not null default now()
);

grant select on public.subscription_payments to authenticated;
alter table public.subscription_payments enable row level security;
drop policy if exists subscription_payments_select on public.subscription_payments;
create policy subscription_payments_select on public.subscription_payments for select
  using (public.is_superadmin());
-- No insert/update policy for any client role — this table is only ever
-- written by the PayFast ITN webhook, which uses the service-role key and
-- bypasses RLS entirely (see app/api/payfast/notify/route.js).
-- ============================================================================
-- OpDesk — iCal channel sync (Airbnb/Booking.com busy-date sync)
-- ============================================================================

-- Each room gets a stable, unguessable export token — this is what goes in
-- the iCal URL you paste into Airbnb/Booking.com's "import calendar" field.
-- It's not a secret in the security sense (an iCal feed only exposes busy/
-- free dates, no guest data), just unguessable enough that someone can't
-- enumerate every room's feed by trying sequential IDs.
alter table public.rooms add column if not exists ical_export_token uuid default gen_random_uuid();

-- Where to pull external busy-dates FROM (the iCal export URL Airbnb/
-- Booking.com already give you in their own calendar settings).
create table if not exists public.room_ical_feeds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  company_id uuid not null references public.companies(id),
  source_name text not null default 'other',  -- airbnb | booking_com | other
  feed_url text not null,
  last_synced_at timestamptz,
  last_sync_status text,   -- ok | error
  last_sync_error text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.room_ical_feeds to authenticated;
alter table public.room_ical_feeds enable row level security;

drop policy if exists room_ical_feeds_select on public.room_ical_feeds;
create policy room_ical_feeds_select on public.room_ical_feeds for select
  using (company_id = public.current_company_id() or public.is_superadmin());

drop policy if exists room_ical_feeds_insert on public.room_ical_feeds;
create policy room_ical_feeds_insert on public.room_ical_feeds for insert
  with check (company_id = public.current_company_id());

drop policy if exists room_ical_feeds_update on public.room_ical_feeds;
create policy room_ical_feeds_update on public.room_ical_feeds for update
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

drop policy if exists room_ical_feeds_delete on public.room_ical_feeds;
create policy room_ical_feeds_delete on public.room_ical_feeds for delete
  using (company_id = public.current_company_id() or public.is_superadmin());

-- Busy date ranges pulled in from external feeds. Deliberately NOT the same
-- table as real bookings — these carry no guest info, they're just "this
-- room is unavailable" markers from another platform, so the app can tell
-- them apart from a genuine OpDesk booking everywhere they're displayed.
create table if not exists public.room_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  company_id uuid not null references public.companies(id),
  feed_id uuid references public.room_ical_feeds(id) on delete cascade,
  source_name text not null default 'other',
  external_uid text,        -- the UID from the external VEVENT, for de-duping on re-sync
  start_date date not null,
  end_date date not null,
  synced_at timestamptz not null default now()
);

grant select on public.room_blocked_dates to authenticated;
alter table public.room_blocked_dates enable row level security;

drop policy if exists room_blocked_dates_select on public.room_blocked_dates;
create policy room_blocked_dates_select on public.room_blocked_dates for select
  using (company_id = public.current_company_id() or public.is_superadmin());
-- No client insert/update/delete policy — only the sync cron job (service
-- role) writes these, same reasoning as subscription_payments earlier.

-- Add-on: iCal channel sync, gated Professional+ or purchasable individually.
insert into public.addon_pricing (addon_key, monthly_price, annual_price)
select 'ical_sync', 149, 1490
where not exists (select 1 from public.addon_pricing where addon_key = 'ical_sync');

update public.marketing_packages
set modules = modules || jsonb_build_object('ical_sync', true)
where slug in ('professional', 'enterprise', 'lodge-professional', 'lodge-enterprise');

update public.marketing_packages
set modules = modules || jsonb_build_object('ical_sync', false)
where slug not in ('professional', 'enterprise', 'lodge-professional', 'lodge-enterprise');
-- ============================================================================
-- OpDesk — Delivery & Supply Services vertical: clients, price list with
-- history, orders with snapshotted line-item prices, mixed staff/casual
-- worker costing, payments and statements
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Clients — the lodges/businesses a supplier delivers to. Distinct from
-- OpDesk's own tenant concept and from tourist "guests" used elsewhere —
-- this is the supplier's own running-account customer list.
-- ----------------------------------------------------------------------------
create table if not exists public.delivery_clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  name text not null,
  contact_person text,
  phone text,
  email text,
  delivery_address text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. Stock items (price list) + price history. current_cost/sell_price are
-- always "what it is right now"; every change is logged to
-- stock_price_history rather than overwritten, so past prices stay visible.
-- ----------------------------------------------------------------------------
create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  name text not null,
  unit text,
  current_cost_price numeric not null default 0,
  current_sell_price numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_price_history (
  id uuid primary key default gen_random_uuid(),
  stock_item_id uuid not null references public.stock_items(id) on delete cascade,
  company_id uuid not null references public.companies(id),
  cost_price numeric not null,
  sell_price numeric not null,
  effective_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Log a history row automatically whenever a stock item's prices change —
-- this is the mechanism that actually satisfies "keep track of prices,
-- older prices": nobody has to remember to log it, it's captured for free
-- the moment they update a price.
create or replace function public.log_stock_price_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') or
     (new.current_cost_price is distinct from old.current_cost_price) or
     (new.current_sell_price is distinct from old.current_sell_price) then
    insert into public.stock_price_history (stock_item_id, company_id, cost_price, sell_price)
    values (new.id, new.company_id, new.current_cost_price, new.current_sell_price);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_stock_price_change on public.stock_items;
create trigger trg_log_stock_price_change
  after insert or update on public.stock_items
  for each row execute function public.log_stock_price_change();

-- ----------------------------------------------------------------------------
-- 3. Orders + line items. Line items snapshot the price at order time
-- (item_name, unit_cost_price, unit_sell_price) rather than referencing the
-- live stock_items row — prices change weekly, and a three-week-old order
-- must keep showing what was actually charged then, not silently update
-- when this week's price list changes.
-- ----------------------------------------------------------------------------
create table if not exists public.delivery_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  client_id uuid not null references public.delivery_clients(id),
  order_ref text not null,
  order_date date not null default current_date,
  vehicle_id uuid references public.vehicles(id),
  vehicle_cost_estimate numeric not null default 0,
  status text not null default 'draft',  -- draft | delivered | invoiced | paid
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.delivery_orders(id) on delete cascade,
  stock_item_id uuid references public.stock_items(id),
  item_name text not null,
  unit text,
  quantity numeric not null,
  unit_cost_price numeric not null,
  unit_sell_price numeric not null,
  created_at timestamptz not null default now()
);

-- Drivers and loaders on an order — either a real staff member (cost pulled
-- from their Cost to Company record) or casual/day labor (a name and a flat
-- manual cost). Both roles support either kind, since a delivery business
-- might use a casual relief driver just as often as a casual loader.
create table if not exists public.delivery_order_workers (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.delivery_orders(id) on delete cascade,
  role text not null,  -- 'driver' | 'loader'
  staff_id uuid references public.staff(id),
  casual_name text,
  cost numeric not null default 0,
  created_at timestamptz not null default now(),
  constraint worker_is_staff_or_casual check (
    (staff_id is not null and casual_name is null) or
    (staff_id is null and casual_name is not null)
  )
);

-- ----------------------------------------------------------------------------
-- 4. Client payments — a running ledger against a client's account, not
-- necessarily one-to-one with a single order (suppliers are often paid in
-- batches covering several deliveries at once).
-- ----------------------------------------------------------------------------
create table if not exists public.delivery_client_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  client_id uuid not null references public.delivery_clients(id),
  amount numeric not null,
  payment_date date not null default current_date,
  method text,
  reference text,
  notes text,
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 5. RLS — standard tenant-scoped pattern used throughout the rest of the app
-- ----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'delivery_clients', 'stock_items', 'stock_price_history',
    'delivery_orders', 'delivery_order_items', 'delivery_order_workers',
    'delivery_client_payments'
  ])
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Tables with a direct company_id column get the simple policy set.
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'delivery_clients', 'stock_items', 'stock_price_history',
    'delivery_orders', 'delivery_client_payments'
  ])
  loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format('create policy %I_select on public.%I for select using (company_id = public.current_company_id() or public.is_superadmin())', t, t);
    execute format('drop policy if exists %I_insert on public.%I', t, t);
    execute format('create policy %I_insert on public.%I for insert with check (company_id = public.current_company_id())', t, t);
    execute format('drop policy if exists %I_update on public.%I', t, t);
    execute format('create policy %I_update on public.%I for update using (company_id = public.current_company_id()) with check (company_id = public.current_company_id())', t, t);
    execute format('drop policy if exists %I_delete on public.%I', t, t);
    execute format('create policy %I_delete on public.%I for delete using (company_id = public.current_company_id() or public.is_superadmin())', t, t);
  end loop;
end $$;

-- delivery_order_items and delivery_order_workers scope via their parent
-- order's company_id (they have no company_id column of their own).
drop policy if exists delivery_order_items_select on public.delivery_order_items;
create policy delivery_order_items_select on public.delivery_order_items for select
  using (exists (select 1 from public.delivery_orders o where o.id = order_id and (o.company_id = public.current_company_id() or public.is_superadmin())));
drop policy if exists delivery_order_items_insert on public.delivery_order_items;
create policy delivery_order_items_insert on public.delivery_order_items for insert
  with check (exists (select 1 from public.delivery_orders o where o.id = order_id and o.company_id = public.current_company_id()));
drop policy if exists delivery_order_items_update on public.delivery_order_items;
create policy delivery_order_items_update on public.delivery_order_items for update
  using (exists (select 1 from public.delivery_orders o where o.id = order_id and o.company_id = public.current_company_id()));
drop policy if exists delivery_order_items_delete on public.delivery_order_items;
create policy delivery_order_items_delete on public.delivery_order_items for delete
  using (exists (select 1 from public.delivery_orders o where o.id = order_id and (o.company_id = public.current_company_id() or public.is_superadmin())));

drop policy if exists delivery_order_workers_select on public.delivery_order_workers;
create policy delivery_order_workers_select on public.delivery_order_workers for select
  using (exists (select 1 from public.delivery_orders o where o.id = order_id and (o.company_id = public.current_company_id() or public.is_superadmin())));
drop policy if exists delivery_order_workers_insert on public.delivery_order_workers;
create policy delivery_order_workers_insert on public.delivery_order_workers for insert
  with check (exists (select 1 from public.delivery_orders o where o.id = order_id and o.company_id = public.current_company_id()));
drop policy if exists delivery_order_workers_update on public.delivery_order_workers;
create policy delivery_order_workers_update on public.delivery_order_workers for update
  using (exists (select 1 from public.delivery_orders o where o.id = order_id and o.company_id = public.current_company_id()));
drop policy if exists delivery_order_workers_delete on public.delivery_order_workers;
create policy delivery_order_workers_delete on public.delivery_order_workers for delete
  using (exists (select 1 from public.delivery_orders o where o.id = order_id and (o.company_id = public.current_company_id() or public.is_superadmin())));


-- ----------------------------------------------------------------------------
-- 6. Gating — new module, Professional+ or purchasable individually,
-- same pattern as Certifications/Shifts/Quotations/iCal Sync.
-- ----------------------------------------------------------------------------
insert into public.addon_pricing (addon_key, monthly_price, annual_price)
select 'delivery_management', 199, 1990
where not exists (select 1 from public.addon_pricing where addon_key = 'delivery_management');

update public.marketing_packages
set modules = modules || jsonb_build_object('delivery_management', true)
where slug in ('professional', 'enterprise', 'lodge-professional', 'lodge-enterprise');

update public.marketing_packages
set modules = modules || jsonb_build_object('delivery_management', false)
where slug not in ('professional', 'enterprise', 'lodge-professional', 'lodge-enterprise');
-- ============================================================================
-- OpDesk — Bookkeeper/accounts officer email (ungated, every plan) + PDF
-- statement infrastructure support
-- ============================================================================

-- Every company can set an accounts/bookkeeping contact — this is basic
-- infrastructure, not a premium feature, so it's deliberately not gated
-- behind any tier the way Certifications/Shifts/etc. are.
alter table public.companies add column if not exists bookkeeper_email text;
-- ============================================================================
-- OpDesk — Logistics & Support Services: dedicated package ladder, job
-- types, and tiered feature gating (vehicle cost suggestions, advanced
-- reporting) reusing the existing limits/modules jsonb pattern
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Job types — generalizes the existing Orders model to cover trade/
-- maintenance callouts and errand/procurement runs, not just bulk stock
-- delivery. Defaulting existing rows to 'delivery' preserves everything
-- your current customer already has.
-- ----------------------------------------------------------------------------
alter table public.delivery_orders add column if not exists job_type text not null default 'delivery';
-- job_type: delivery | maintenance | errand | procurement | other

-- ----------------------------------------------------------------------------
-- 2. The new operator type + Logistics & Support Services packages.
-- Free/Basic/Standard match the existing ladders' price points; Professional
-- and Enterprise are priced lower, reflecting a newer, less-proven vertical
-- with typically thinner-margin customers (tradespeople, small delivery ops)
-- than an established lodge or safari operator.
--
-- Feature gating for this vertical reuses the existing `limits` jsonb on
-- marketing_packages rather than inventing a new gating mechanism:
--   clients, orders_per_month   — numeric caps, same pattern as rooms/vehicles
--   vehicle_cost_suggestions    — Standard+: suggests an average cost per
--                                 vehicle from past orders instead of a blank field
--   recurring_orders            — Professional+: repeat-order templates (not yet built — see summary)
--   advanced_reporting          — Professional+: profit trend + client ranking
--   quoted_vs_actual            — Enterprise: quote vs. real cost tracking (not yet built)
--   cost_breakdown_analytics    — Enterprise: cost-mix analytics + CSV export (not yet built)
-- ----------------------------------------------------------------------------
insert into public.marketing_packages (name, slug, tagline, monthly_price, annual_price, badge, recommended_for, limits, modules, sort_order)
select * from (values
  ('Logistics Free', 'logistics-free', 'Try it out — a single client, light volume', 0, 0, null,
   ARRAY['delivery']::text[],
   '{"clients":1,"orders_per_month":20,"vehicle_cost_suggestions":false,"recurring_orders":false,"advanced_reporting":false,"quoted_vs_actual":false,"cost_breakdown_analytics":false}'::jsonb,
   '{"certifications":false,"shifts":false,"costs":false,"leave":false}'::jsonb, 20),
  ('Logistics Basic', 'logistics-basic', 'Solo operators and small delivery runs', 299, 2990, null,
   ARRAY['delivery']::text[],
   '{"clients":5,"orders_per_month":null,"vehicle_cost_suggestions":false,"recurring_orders":false,"advanced_reporting":false,"quoted_vs_actual":false,"cost_breakdown_analytics":false}'::jsonb,
   '{"certifications":false,"shifts":false,"costs":false,"leave":false}'::jsonb, 21),
  ('Logistics Standard', 'logistics-standard', 'Growing supply, trade, and errand businesses', 999, 9990, 'Most Popular',
   ARRAY['delivery']::text[],
   '{"clients":20,"orders_per_month":null,"vehicle_cost_suggestions":true,"recurring_orders":false,"advanced_reporting":false,"quoted_vs_actual":false,"cost_breakdown_analytics":false}'::jsonb,
   '{"certifications":false,"shifts":true,"costs":false,"leave":true}'::jsonb, 22),
  ('Logistics Professional', 'logistics-professional', 'Multi-client operations with real reporting needs', 1899, 18990, null,
   ARRAY['delivery']::text[],
   '{"clients":null,"orders_per_month":null,"vehicle_cost_suggestions":true,"recurring_orders":true,"advanced_reporting":true,"quoted_vs_actual":false,"cost_breakdown_analytics":false}'::jsonb,
   '{"certifications":true,"shifts":true,"costs":false,"leave":true}'::jsonb, 23),
  ('Logistics Enterprise', 'logistics-enterprise', 'Established logistics and support service operations', 3699, 36990, null,
   ARRAY['delivery']::text[],
   '{"clients":null,"orders_per_month":null,"vehicle_cost_suggestions":true,"recurring_orders":true,"advanced_reporting":true,"quoted_vs_actual":true,"cost_breakdown_analytics":true}'::jsonb,
   '{"certifications":true,"shifts":true,"costs":true,"leave":true}'::jsonb, 24)
) as v(name,slug,tagline,monthly_price,annual_price,badge,recommended_for,limits,modules,sort_order)
where not exists (select 1 from public.marketing_packages where slug = v.slug);
-- ============================================================================
-- OpDesk — Public Operator Profiles (marketing-only, no booking/payment)
-- Free on every plan.
-- ============================================================================

-- Opt-in flags, deliberately separate — a lodge might want a public
-- description and photos without ever exposing live availability, or vice
-- versa. Both default to false: this is opt-IN, never opt-out.
alter table public.companies add column if not exists public_profile_enabled boolean not null default false;
alter table public.companies add column if not exists public_calendar_enabled boolean not null default false;
alter table public.companies add column if not exists public_description text;
alter table public.companies add column if not exists public_slug text unique;

-- current_company_id() was previously only granted to `authenticated` —
-- fine until now, since anon never needed to touch a table gated partly by
-- it. With public profiles, Postgres evaluates every RLS policy on a table
-- together (even ones that don't end up applying to the caller's role), so
-- if evaluating company_photos_select_own's call to this function raises a
-- permission error for anon, the WHOLE query fails — even though the
-- separate company_photos_select_public policy would have legitimately
-- allowed the row. The function itself is safe to expose: it just returns
-- NULL when there's no matching profile, which is exactly the anon case.
grant execute on function public.current_company_id() to anon;
grant execute on function public.is_superadmin() to anon;

-- RLS controls which ROWS are visible, not which COLUMNS — so a plain
-- public-read policy on `companies` itself would leak email, billing, and
-- subscription internals for any company that opts into a public profile.
-- This function answers only "yes/no, does this company have profiles
-- turned on" without exposing anything else, the same safe pattern
-- current_company_id()/is_superadmin() already use.
create or replace function public.company_has_public_profile(p_company_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.companies where id = p_company_id and public_profile_enabled = true)
$$;
grant execute on function public.company_has_public_profile(uuid) to anon, authenticated;

-- The actual data source for public profile pages — a narrow view exposing
-- ONLY fields that are genuinely meant to be public, never the base table
-- directly (which anon correctly cannot read at all).
create or replace view public.public_operator_profiles as
select id, name, public_slug, public_description, operator_type, country, public_calendar_enabled, created_at
from public.companies
where public_profile_enabled = true and public_slug is not null;

grant select on public.public_operator_profiles to anon, authenticated;

-- Exposes ONLY start/end dates for a company's bookings, never guest names,
-- amounts, or any other detail — and only when that company has explicitly
-- opted into public_calendar_enabled. This is the same busy/free-only
-- principle already used for the Airbnb/Booking.com iCal sync, applied here
-- to the public profile page instead.
create or replace function public.get_public_busy_dates(p_company_id uuid)
returns table(start_date date, end_date date)
language sql stable security definer set search_path = public
as $$
  select b.start_date, b.end_date
  from public.bookings b
  where b.company_id = p_company_id
    and exists (
      select 1 from public.companies c
      where c.id = p_company_id and c.public_profile_enabled = true and c.public_calendar_enabled = true
    )
$$;
grant execute on function public.get_public_busy_dates(uuid) to anon, authenticated;

-- Photos — metadata only; the actual image bytes live in Supabase Storage
-- (see the bucket + storage policies below).
create table if not exists public.company_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.company_photos to authenticated;
grant select on public.company_photos to anon; -- public profile pages need to read these without a session
alter table public.company_photos enable row level security;

drop policy if exists company_photos_select_own on public.company_photos;
create policy company_photos_select_own on public.company_photos for select
  using (company_id = public.current_company_id() or public.is_superadmin());

-- Separate, additional read policy: anyone (including anonymous visitors)
-- can see photos for a company that has actually opted into a public
-- profile — this is what makes /operators/[slug] work without a login.
drop policy if exists company_photos_select_public on public.company_photos;
create policy company_photos_select_public on public.company_photos for select
  using (public.company_has_public_profile(company_id));

drop policy if exists company_photos_insert on public.company_photos;
create policy company_photos_insert on public.company_photos for insert
  with check (company_id = public.current_company_id());
drop policy if exists company_photos_update on public.company_photos;
create policy company_photos_update on public.company_photos for update
  using (company_id = public.current_company_id());
drop policy if exists company_photos_delete on public.company_photos;
create policy company_photos_delete on public.company_photos for delete
  using (company_id = public.current_company_id() or public.is_superadmin());

-- ----------------------------------------------------------------------------
-- Storage bucket for the actual photo files. Public read (profile photos
-- are meant to be publicly viewable once a company opts in — access control
-- for WHICH companies show up happens at the app/query level via
-- public_profile_enabled, same as any other public marketing image), write
-- restricted to a company's own folder path (company_id/filename.jpg).
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select 'company-photos', 'company-photos', true, 5242880, array['image/jpeg','image/png','image/webp']
where not exists (select 1 from storage.buckets where id = 'company-photos');

drop policy if exists company_photos_storage_read on storage.objects;
create policy company_photos_storage_read on storage.objects for select
  using (bucket_id = 'company-photos');

drop policy if exists company_photos_storage_insert on storage.objects;
create policy company_photos_storage_insert on storage.objects for insert
  with check (bucket_id = 'company-photos' and (storage.foldername(name))[1] = public.current_company_id()::text);

drop policy if exists company_photos_storage_delete on storage.objects;
create policy company_photos_storage_delete on storage.objects for delete
  using (bucket_id = 'company-photos' and (storage.foldername(name))[1] = public.current_company_id()::text);
-- ============================================================================
-- OpDesk — Real payment capture and statements for the general Invoices
-- module (previously "Paid" was just a manually-picked status with no
-- actual payment record behind it — no amount, no date, no partial
-- payments). Applies the same pattern already built and tested for the
-- Logistics vertical.
-- ============================================================================

create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric not null,
  payment_date date not null default current_date,
  method text,
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.invoice_payments to authenticated;
alter table public.invoice_payments enable row level security;

drop policy if exists invoice_payments_select on public.invoice_payments;
create policy invoice_payments_select on public.invoice_payments for select
  using (company_id = public.current_company_id() or public.is_superadmin());
drop policy if exists invoice_payments_insert on public.invoice_payments;
create policy invoice_payments_insert on public.invoice_payments for insert
  with check (company_id = public.current_company_id());
drop policy if exists invoice_payments_update on public.invoice_payments;
create policy invoice_payments_update on public.invoice_payments for update
  using (company_id = public.current_company_id());
drop policy if exists invoice_payments_delete on public.invoice_payments;
create policy invoice_payments_delete on public.invoice_payments for delete
  using (company_id = public.current_company_id() or public.is_superadmin());

-- Keeps invoices.amount_paid / paid_at / status in sync automatically —
-- these columns already existed in the original schema but were never
-- actually populated by any code. Any existing or future code reading them
-- directly (reports, exports) gets a correct value without needing to know
-- the new invoice_payments table exists. Never overrides a manual
-- 'cancelled' status, and never downgrades 'paid' back to 'sent' if a
-- payment is edited down — only forward transitions on the paid path.
create or replace function public.sync_invoice_payment_totals()
returns trigger language plpgsql as $$
declare
  v_invoice_id uuid;
  v_total_paid numeric;
  v_invoice_total numeric;
  v_current_status text;
begin
  v_invoice_id := coalesce(new.invoice_id, old.invoice_id);
  select coalesce(sum(amount), 0) into v_total_paid from public.invoice_payments where invoice_id = v_invoice_id;
  select total, status into v_invoice_total, v_current_status from public.invoices where id = v_invoice_id;

  update public.invoices
  set amount_paid = v_total_paid,
      paid_at = case when v_total_paid >= v_invoice_total and v_invoice_total > 0 then now() else null end,
      status = case
        when v_total_paid >= v_invoice_total and v_invoice_total > 0 and v_current_status not in ('cancelled') then 'paid'
        when v_current_status = 'paid' and v_total_paid < v_invoice_total then 'sent'
        else v_current_status
      end
  where id = v_invoice_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_invoice_payment_totals on public.invoice_payments;
create trigger trg_sync_invoice_payment_totals
  after insert or update or delete on public.invoice_payments
  for each row execute function public.sync_invoice_payment_totals();
-- ============================================================================
-- OpDesk — Pricing restructure: Lodging as the anchor vertical (kept
-- near-competition), Tours & Transport at 30% below Lodging, Logistics &
-- Support a further 20% below Tours. Deliberate reversal of the previous
-- relationship, where Tours was priced slightly above Lodging.
-- ============================================================================

-- Tours & Transport (generic ladder) — was 349/1099/2499/4999, now 30% below Lodging
update public.marketing_packages set monthly_price = 209, annual_price = 2090 where slug = 'basic';
update public.marketing_packages set monthly_price = 699, annual_price = 6990 where slug = 'standard';
update public.marketing_packages set monthly_price = 1609, annual_price = 16090 where slug = 'professional';
update public.marketing_packages set monthly_price = 3219, annual_price = 32190 where slug = 'enterprise';

-- Logistics & Support Services — was 299/999/1899/3699, now a further 20% below the new Tours rates
update public.marketing_packages set monthly_price = 169, annual_price = 1690 where slug = 'logistics-basic';
update public.marketing_packages set monthly_price = 559, annual_price = 5590 where slug = 'logistics-standard';
update public.marketing_packages set monthly_price = 1289, annual_price = 12890 where slug = 'logistics-professional';
update public.marketing_packages set monthly_price = 2579, annual_price = 25790 where slug = 'logistics-enterprise';

-- Lodging stays unchanged — it's the anchor.
-- ============================================================================
-- OpDesk — Checklist & Inventory Lists module (Professional+ on Tours &
-- Transport and Lodging), plus a real security fix for the logo storage
-- bucket that's existed unused since the original schema.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Fix the logos bucket RLS. The original policy only checked
-- `auth.uid() is not null` on insert — ANY logged-in user from ANY company
-- could upload to ANY path in this bucket, including overwriting another
-- company's logo if they knew or guessed the path. Nothing has actually
-- used this bucket yet, so this is the right moment to close it properly
-- before real usage begins, matching the same company-folder-scoped
-- pattern already used correctly for company-photos.
-- ----------------------------------------------------------------------------
drop policy if exists "company_logos" on storage.objects;
drop policy if exists "logos_insert_own_company" on storage.objects;
create policy "logos_insert_own_company" on storage.objects for insert
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = public.current_company_id()::text);

drop policy if exists "logos_update_own_company" on storage.objects;
create policy "logos_update_own_company" on storage.objects for update
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = public.current_company_id()::text);

drop policy if exists "logos_delete_own_company" on storage.objects;
create policy "logos_delete_own_company" on storage.objects for delete
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = public.current_company_id()::text);

-- ----------------------------------------------------------------------------
-- 2. Checklist templates and items. One flexible system covers both the
-- trip/vehicle checklist (Safari & Shuttle) and room inventory (Lodging)
-- use cases — both are just "a named list of items, some with a quantity" —
-- rather than building two structurally-identical systems.
-- ----------------------------------------------------------------------------
create table if not exists public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  category text not null default 'general', -- trip_check | room_inventory | general — a label only, not enforced
  created_at timestamptz not null default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.checklist_templates(id) on delete cascade,
  name text not null,
  quantity text, -- free text ("2", "x4 per room") — deliberately not numeric-only, since some items are just a yes/no check
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.checklist_templates to authenticated;
grant select, insert, update, delete on public.checklist_items to authenticated;
alter table public.checklist_templates enable row level security;
alter table public.checklist_items enable row level security;

drop policy if exists checklist_templates_select on public.checklist_templates;
create policy checklist_templates_select on public.checklist_templates for select
  using (company_id = public.current_company_id() or public.is_superadmin());
drop policy if exists checklist_templates_insert on public.checklist_templates;
create policy checklist_templates_insert on public.checklist_templates for insert
  with check (company_id = public.current_company_id());
drop policy if exists checklist_templates_update on public.checklist_templates;
create policy checklist_templates_update on public.checklist_templates for update
  using (company_id = public.current_company_id());
drop policy if exists checklist_templates_delete on public.checklist_templates;
create policy checklist_templates_delete on public.checklist_templates for delete
  using (company_id = public.current_company_id() or public.is_superadmin());

-- checklist_items has no company_id of its own — scope via the parent template.
drop policy if exists checklist_items_select on public.checklist_items;
create policy checklist_items_select on public.checklist_items for select
  using (exists (select 1 from public.checklist_templates t where t.id = template_id and (t.company_id = public.current_company_id() or public.is_superadmin())));
drop policy if exists checklist_items_insert on public.checklist_items;
create policy checklist_items_insert on public.checklist_items for insert
  with check (exists (select 1 from public.checklist_templates t where t.id = template_id and t.company_id = public.current_company_id()));
drop policy if exists checklist_items_update on public.checklist_items;
create policy checklist_items_update on public.checklist_items for update
  using (exists (select 1 from public.checklist_templates t where t.id = template_id and t.company_id = public.current_company_id()));
drop policy if exists checklist_items_delete on public.checklist_items;
create policy checklist_items_delete on public.checklist_items for delete
  using (exists (select 1 from public.checklist_templates t where t.id = template_id and (t.company_id = public.current_company_id() or public.is_superadmin())));

-- ----------------------------------------------------------------------------
-- 3. Gating — Professional+ on Tours & Transport and Lodging specifically,
-- matching what was actually asked for (not Logistics, not lower tiers).
-- ----------------------------------------------------------------------------
insert into public.addon_pricing (addon_key, monthly_price, annual_price)
select 'checklists', 99, 990
where not exists (select 1 from public.addon_pricing where addon_key = 'checklists');

update public.marketing_packages
set modules = modules || jsonb_build_object('checklists', true)
where slug in ('professional', 'enterprise', 'lodge-professional', 'lodge-enterprise');

update public.marketing_packages
set modules = modules || jsonb_build_object('checklists', false)
where slug not in ('professional', 'enterprise', 'lodge-professional', 'lodge-enterprise');
-- ============================================================================
-- OpDesk — Pricing rebalance: module add-ons raised to real standalone
-- value, package prices trimmed so that Standard and Professional tiers
-- (across all three verticals) are always at least 20% cheaper than
-- buying the same bundled modules individually. Basic and Enterprise
-- tiers are treated as legitimate exceptions since their value is driven
-- by capacity (room/vehicle/guide slot limits, up to unlimited at
-- Enterprise) rather than by these specific gated modules, and unlimited
-- capacity has no finite individual add-on price to compare against.
-- ============================================================================

-- Module add-on prices, raised to reflect real standalone value
update public.addon_pricing set monthly_price = 260, annual_price = 2600 where addon_key = 'leave';
update public.addon_pricing set monthly_price = 260, annual_price = 2600 where addon_key = 'checklists';
update public.addon_pricing set monthly_price = 260, annual_price = 2600 where addon_key = 'quotations';
update public.addon_pricing set monthly_price = 390, annual_price = 3900 where addon_key = 'ical_sync';
update public.addon_pricing set monthly_price = 390, annual_price = 3900 where addon_key = 'certifications';
update public.addon_pricing set monthly_price = 520, annual_price = 5200 where addon_key = 'schedules_module';
update public.addon_pricing set monthly_price = 520, annual_price = 5200 where addon_key = 'delivery_management';
update public.addon_pricing set monthly_price = 650, annual_price = 6500 where addon_key = 'cost_to_company';

-- hr_bundle (Certifications + Shifts + Cost to Company + Leave) directly
-- bundles four modules just repriced above. Left at its old R499, it would
-- now sit at a 73% discount off the new component sum (R1,820) -- no
-- longer a credible bundle deal, just looks like a stale price. Rebalanced
-- to a genuine ~40% bundle discount instead.
update public.addon_pricing set monthly_price = 1090, annual_price = 10900 where addon_key = 'hr_bundle';

-- Package prices — Tours & Transport
update public.marketing_packages set monthly_price = 200,  annual_price = 2000  where slug = 'basic';
update public.marketing_packages set monthly_price = 690,  annual_price = 6900  where slug = 'standard';
update public.marketing_packages set monthly_price = 1600, annual_price = 16000 where slug = 'professional';
update public.marketing_packages set monthly_price = 2740, annual_price = 27400 where slug = 'enterprise';

-- Package prices — Lodging
update public.marketing_packages set monthly_price = 280,  annual_price = 2800  where slug = 'lodge-basic';
update public.marketing_packages set monthly_price = 860,  annual_price = 8600  where slug = 'lodge-standard';
update public.marketing_packages set monthly_price = 2160, annual_price = 21600 where slug = 'lodge-professional';
update public.marketing_packages set monthly_price = 3910, annual_price = 39100 where slug = 'lodge-enterprise';

-- Package prices — Logistics & Support Services
update public.marketing_packages set monthly_price = 550,  annual_price = 5500  where slug = 'logistics-standard';
update public.marketing_packages set monthly_price = 970,  annual_price = 9700  where slug = 'logistics-professional';
update public.marketing_packages set monthly_price = 2190, annual_price = 21900 where slug = 'logistics-enterprise';
