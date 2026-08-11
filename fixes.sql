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
