-- ============================================================
-- OpDesk V2 — Clean Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Helper: updated_at trigger ────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ══════════════════════════════════════════════════════════
-- COMPANIES
-- ══════════════════════════════════════════════════════════
create table if not exists companies (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  name                  text not null,
  slug                  text unique,
  operator_type         text not null default 'safari',
  subscription_tier     text not null default 'explorer',
  subscription_type     text not null default 'tours',
  subscription_expires_at timestamptz,
  billing_email         text,
  currency              text not null default 'ZAR',
  language              text not null default 'en',
  country               text not null default 'ZA',
  timezone              text not null default 'Africa/Johannesburg',
  logo_url              text,
  primary_color         text default '#D4A853',
  address               text,
  phone                 text,
  email                 text,
  vat_number            text,
  website               text,
  active                boolean default true,
  onboarding_complete   boolean default false
);
create trigger companies_updated_at before update on companies
  for each row execute function set_updated_at();

-- ══════════════════════════════════════════════════════════
-- PROFILES (one per auth user)
-- ══════════════════════════════════════════════════════════
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid references companies(id) on delete cascade,
  full_name   text,
  email       text,
  role        text not null default 'viewer',
  avatar_url  text,
  phone       text,
  is_superadmin boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ══════════════════════════════════════════════════════════
-- STAFF (employees — not app users)
-- ══════════════════════════════════════════════════════════
create table if not exists staff (
  id                      uuid primary key default gen_random_uuid(),
  company_id              uuid not null references companies(id) on delete cascade,
  full_name               text not null,
  id_number               text,
  passport_number         text,
  staff_type              text not null default 'guide',
  employment_type         text not null default 'fulltime',
  status                  text not null default 'active',
  start_date              date,
  end_date                date,
  phone                   text,
  email                   text,
  photo_url               text,
  address                 text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  notes                   text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);
create trigger staff_updated_at before update on staff
  for each row execute function set_updated_at();

-- ══════════════════════════════════════════════════════════
-- STAFF CERTIFICATIONS
-- ══════════════════════════════════════════════════════════
create table if not exists staff_certifications (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid not null references staff(id) on delete cascade,
  company_id   uuid not null references companies(id) on delete cascade,
  cert_type    text not null,
  cert_number  text,
  issuing_body text,
  issue_date   date,
  expiry_date  date,
  document_url text,
  notes        text,
  created_at   timestamptz default now()
);

-- Computed cert status view
create or replace view staff_certifications_with_status as
select *,
  case
    when expiry_date is null                          then 'no_expiry'
    when expiry_date < current_date                   then 'expired'
    when expiry_date < current_date + interval '60 days' then 'expiring_soon'
    else 'valid'
  end as status
from staff_certifications;

-- ══════════════════════════════════════════════════════════
-- STAFF COST TO COMPANY
-- ══════════════════════════════════════════════════════════
create table if not exists staff_cost (
  id                        uuid primary key default gen_random_uuid(),
  staff_id                  uuid not null references staff(id) on delete cascade,
  company_id                uuid not null references companies(id) on delete cascade,
  effective_from            date not null,
  effective_to              date,
  currency                  text not null default 'ZAR',
  -- Earnings
  basic_salary              numeric not null default 0,
  housing_allowance         numeric default 0,
  transport_allowance       numeric default 0,
  meal_allowance            numeric default 0,
  other_allowances          numeric default 0,
  -- Employee deductions
  uif_employee              numeric default 0,
  paye                      numeric default 0,
  medical_aid_employee      numeric default 0,
  other_deductions          numeric default 0,
  -- Employer contributions
  uif_employer              numeric default 0,
  medical_aid_employer      numeric default 0,
  -- Notes
  notes                     text,
  created_at                timestamptz default now(),
  -- Computed columns
  gross_salary numeric generated always as (
    basic_salary + housing_allowance + transport_allowance + meal_allowance + other_allowances
  ) stored,
  total_deductions numeric generated always as (
    uif_employee + paye + medical_aid_employee + other_deductions
  ) stored,
  net_take_home numeric generated always as (
    basic_salary + housing_allowance + transport_allowance + meal_allowance + other_allowances
    - uif_employee - paye - medical_aid_employee - other_deductions
  ) stored,
  cost_to_company numeric generated always as (
    basic_salary + housing_allowance + transport_allowance + meal_allowance + other_allowances
    + uif_employer + medical_aid_employer
  ) stored
);

-- ══════════════════════════════════════════════════════════
-- STAFF LEAVE
-- ══════════════════════════════════════════════════════════
create table if not exists staff_leave (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid not null references staff(id) on delete cascade,
  company_id   uuid not null references companies(id) on delete cascade,
  leave_type   text not null default 'annual',
  start_date   date not null,
  end_date     date not null,
  days         numeric,
  status       text not null default 'pending',
  approved_by  uuid references profiles(id),
  approved_at  timestamptz,
  notes        text,
  created_at   timestamptz default now()
);

-- ══════════════════════════════════════════════════════════
-- VEHICLES
-- ══════════════════════════════════════════════════════════
create table if not exists vehicles (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references companies(id) on delete cascade,
  name                text not null,
  type                text default 'game_vehicle',
  registration        text,
  make                text,
  model               text,
  year                integer,
  capacity            integer,
  status              text not null default 'available',
  fuel_type           text,
  colour              text,
  licence_expiry      date,
  roadworthy_expiry   date,
  insurance_expiry    date,
  tracker_id          text,
  photo_url           text,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create trigger vehicles_updated_at before update on vehicles
  for each row execute function set_updated_at();

-- ══════════════════════════════════════════════════════════
-- VESSELS
-- ══════════════════════════════════════════════════════════
create table if not exists vessels (
  id                       uuid primary key default gen_random_uuid(),
  company_id               uuid not null references companies(id) on delete cascade,
  name                     text not null,
  type                     text default 'fishing_boat',
  registration             text,
  make                     text,
  model                    text,
  year                     integer,
  capacity                 integer,
  length_meters            numeric,
  status                   text not null default 'available',
  skipper_licence_required boolean default true,
  licence_expiry           date,
  insurance_expiry         date,
  cof_expiry               date,
  home_port                text,
  photo_url                text,
  notes                    text,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);
create trigger vessels_updated_at before update on vessels
  for each row execute function set_updated_at();

-- ══════════════════════════════════════════════════════════
-- ROOMS (lodging)
-- ══════════════════════════════════════════════════════════
create table if not exists rooms (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  name            text not null,
  room_type       text default 'double',
  floor           integer,
  capacity        integer not null default 2,
  rate_per_night  numeric not null default 0,
  currency        text not null default 'ZAR',
  status          text not null default 'available',
  amenities       text[] default '{}',
  description     text,
  photo_urls      text[] default '{}',
  notes           text,
  active          boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create trigger rooms_updated_at before update on rooms
  for each row execute function set_updated_at();

-- ══════════════════════════════════════════════════════════
-- BOOKINGS
-- ══════════════════════════════════════════════════════════
create table if not exists bookings (
  id                   uuid primary key default gen_random_uuid(),
  company_id           uuid not null references companies(id) on delete cascade,
  booking_ref          text unique,
  booking_type         text not null default 'tour',
  status               text not null default 'pending',
  -- Guest
  guest_name           text,
  guest_email          text,
  guest_phone          text,
  guest_country        text,
  guest_count          integer default 1,
  -- Dates
  start_date           date not null,
  end_date             date,
  start_time           time,
  end_time             time,
  -- Finance
  currency             text not null default 'ZAR',
  amount_total         numeric default 0,
  amount_paid          numeric default 0,
  payment_method       text,
  -- Assignments
  guide_id             uuid references staff(id),
  driver_id            uuid references staff(id),
  vehicle_id           uuid references vehicles(id),
  vessel_id            uuid references vessels(id),
  room_id              uuid references rooms(id),
  -- Details
  pickup_location      text,
  dropoff_location     text,
  notes                text,
  special_requirements text,
  source               text default 'direct',
  created_by           uuid references profiles(id),
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  -- Computed
  amount_due numeric generated always as (amount_total - amount_paid) stored
);
create trigger bookings_updated_at before update on bookings
  for each row execute function set_updated_at();

-- Auto-generate booking ref
create or replace function generate_booking_ref()
returns trigger language plpgsql as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq
  from bookings where company_id = new.company_id
    and extract(year from created_at) = extract(year from now());
  new.booking_ref := 'OPD-' || yr || '-' || lpad(seq::text, 4, '0');
  return new;
end;
$$;
create trigger set_booking_ref before insert on bookings
  for each row when (new.booking_ref is null)
  execute function generate_booking_ref();

-- ══════════════════════════════════════════════════════════
-- ROOM BOOKINGS (extends bookings for lodging detail)
-- ══════════════════════════════════════════════════════════
create table if not exists room_bookings (
  id                   uuid primary key default gen_random_uuid(),
  booking_id           uuid not null references bookings(id) on delete cascade,
  room_id              uuid not null references rooms(id),
  company_id           uuid not null references companies(id) on delete cascade,
  check_in             date not null,
  check_out            date not null,
  nights               integer,
  rate_per_night       numeric,
  total_room_cost      numeric,
  guest_name           text,
  guest_id_passport    text,
  guest_nationality    text,
  housekeeping_status  text not null default 'clean',
  special_requests     text,
  created_at           timestamptz default now(),
  -- Prevent double-booking same room
  constraint no_double_booking exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
);

-- ══════════════════════════════════════════════════════════
-- HOUSEKEEPING TASKS
-- ══════════════════════════════════════════════════════════
create table if not exists housekeeping_tasks (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  room_id        uuid not null references rooms(id),
  assigned_to    uuid references staff(id),
  task_type      text not null default 'clean',
  scheduled_for  timestamptz,
  completed_at   timestamptz,
  status         text not null default 'pending',
  notes          text,
  created_at     timestamptz default now()
);

-- ══════════════════════════════════════════════════════════
-- SHIFTS & SCHEDULES
-- ══════════════════════════════════════════════════════════
create table if not exists shifts (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  staff_id    uuid not null references staff(id) on delete cascade,
  booking_id  uuid references bookings(id),
  shift_date  date not null,
  start_time  time,
  end_time    time,
  shift_type  text default 'full_day',
  role        text,
  status      text not null default 'scheduled',
  notes       text,
  created_at  timestamptz default now()
);

-- ══════════════════════════════════════════════════════════
-- TRAILS
-- ══════════════════════════════════════════════════════════
create table if not exists trails (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  name            text not null,
  difficulty      text default 'moderate',
  distance_km     numeric,
  duration_hours  numeric,
  max_pax         integer,
  description     text,
  highlights      text,
  start_point     text,
  end_point       text,
  gpx_url         text,
  active          boolean default true,
  created_at      timestamptz default now()
);

-- ══════════════════════════════════════════════════════════
-- FIREARM REGISTER
-- ══════════════════════════════════════════════════════════
create table if not exists firearm_register (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  staff_id        uuid references staff(id),
  firearm_make    text,
  firearm_model   text,
  calibre         text,
  serial_number   text,
  licence_number  text,
  licence_expiry  date,
  safe_location   text,
  status          text not null default 'stored',
  notes           text,
  created_at      timestamptz default now()
);

-- ══════════════════════════════════════════════════════════
-- INVOICES
-- ══════════════════════════════════════════════════════════
create table if not exists invoices (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  booking_id      uuid references bookings(id),
  invoice_number  text unique,
  invoice_type    text not null default 'proforma',
  status          text not null default 'draft',
  guest_name      text,
  guest_email     text,
  guest_address   text,
  currency        text not null default 'ZAR',
  subtotal        numeric not null default 0,
  vat_rate        numeric default 15,
  vat_amount      numeric default 0,
  total           numeric not null default 0,
  amount_paid     numeric default 0,
  due_date        date,
  paid_at         timestamptz,
  notes           text,
  line_items      jsonb default '[]',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create trigger invoices_updated_at before update on invoices
  for each row execute function set_updated_at();

-- Auto invoice number
create or replace function generate_invoice_number()
returns trigger language plpgsql as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq
  from invoices where company_id = new.company_id
    and extract(year from created_at) = extract(year from now());
  new.invoice_number := 'INV-' || yr || '-' || lpad(seq::text, 4, '0');
  return new;
end;
$$;
create trigger set_invoice_number before insert on invoices
  for each row when (new.invoice_number is null)
  execute function generate_invoice_number();

-- ══════════════════════════════════════════════════════════
-- SUPPORT TICKETS
-- ══════════════════════════════════════════════════════════
create table if not exists support_tickets (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid references companies(id),
  submitted_by   uuid references profiles(id),
  category       text,
  subject        text not null,
  description    text,
  status         text not null default 'open',
  priority       text not null default 'normal',
  assigned_to    text,
  resolved_at    timestamptz,
  created_at     timestamptz default now()
);

-- ══════════════════════════════════════════════════════════
-- PAYFAST LOGS & ADD-ONS
-- ══════════════════════════════════════════════════════════
create table if not exists payfast_itn_log (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  payment_status text,
  pf_payment_id  text,
  m_payment_id   text,
  amount_gross   numeric,
  company_id     uuid references companies(id),
  intent         jsonb,
  raw_params     jsonb,
  outcome        text,
  error          text
);

create table if not exists company_addons (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  addon_key      text not null,
  addon_type     text,
  quantity       integer default 1,
  price_per_unit numeric,
  billing_cycle  text default 'monthly',
  active         boolean default true,
  note           text,
  created_at     timestamptz default now()
);

-- ══════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════
create index if not exists idx_profiles_company    on profiles(company_id);
create index if not exists idx_staff_company       on staff(company_id);
create index if not exists idx_staff_type          on staff(company_id, staff_type);
create index if not exists idx_certs_staff         on staff_certifications(staff_id);
create index if not exists idx_certs_expiry        on staff_certifications(expiry_date);
create index if not exists idx_costs_staff         on staff_cost(staff_id);
create index if not exists idx_leave_staff         on staff_leave(staff_id);
create index if not exists idx_bookings_company    on bookings(company_id);
create index if not exists idx_bookings_dates      on bookings(company_id, start_date);
create index if not exists idx_bookings_status     on bookings(company_id, status);
create index if not exists idx_room_bookings_room  on room_bookings(room_id, check_in, check_out);
create index if not exists idx_shifts_staff        on shifts(staff_id, shift_date);
create index if not exists idx_shifts_company      on shifts(company_id, shift_date);
create index if not exists idx_invoices_company    on invoices(company_id);
create index if not exists idx_housekeeping_room   on housekeeping_tasks(room_id, status);

-- ══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════
alter table companies             enable row level security;
alter table profiles              enable row level security;
alter table staff                 enable row level security;
alter table staff_certifications  enable row level security;
alter table staff_cost            enable row level security;
alter table staff_leave           enable row level security;
alter table vehicles              enable row level security;
alter table vessels               enable row level security;
alter table rooms                 enable row level security;
alter table bookings              enable row level security;
alter table room_bookings         enable row level security;
alter table housekeeping_tasks    enable row level security;
alter table shifts                enable row level security;
alter table trails                enable row level security;
alter table firearm_register      enable row level security;
alter table invoices              enable row level security;
alter table support_tickets       enable row level security;
alter table company_addons        enable row level security;

-- Helper: get current user's company_id
create or replace function my_company_id()
returns uuid language sql security definer stable as $$
  select company_id from profiles where id = auth.uid()
$$;

-- Helper: is superadmin
create or replace function is_superadmin()
returns boolean language sql security definer stable as $$
  select coalesce((select is_superadmin from profiles where id = auth.uid()), false)
$$;

-- RLS Policies — companies
create policy "users see own company"   on companies for select using (id = my_company_id() or is_superadmin());
create policy "users update own company" on companies for update using (id = my_company_id());

-- RLS Policies — profiles
create policy "users see own profile"   on profiles for select using (id = auth.uid() or company_id = my_company_id() or is_superadmin());
create policy "users update own profile" on profiles for update using (id = auth.uid());

-- Generic company-scoped policy for all other tables
do $$ declare t text; begin
  foreach t in array array[
    'staff','staff_certifications','staff_cost','staff_leave',
    'vehicles','vessels','rooms','bookings','room_bookings',
    'housekeeping_tasks','shifts','trails','firearm_register',
    'invoices','support_tickets','company_addons'
  ] loop
    execute format('create policy "company_scope_select_%s" on %s for select using (company_id = my_company_id() or is_superadmin())', t, t);
    execute format('create policy "company_scope_insert_%s" on %s for insert with check (company_id = my_company_id())', t, t);
    execute format('create policy "company_scope_update_%s" on %s for update using (company_id = my_company_id())', t, t);
    execute format('create policy "company_scope_delete_%s" on %s for delete using (company_id = my_company_id())', t, t);
  end loop;
end $$;

-- Superadmin can see payfast logs
alter table payfast_itn_log enable row level security;
create policy "superadmin_payfast" on payfast_itn_log for all using (is_superadmin());

-- ══════════════════════════════════════════════════════════
-- SUPERADMIN RPCs (service-role calls from API)
-- ══════════════════════════════════════════════════════════
create or replace function sa_update_company(
  p_company_id uuid,
  p_tier text,
  p_expires_at timestamptz
) returns void language plpgsql security definer as $$
begin
  update companies
  set subscription_tier = p_tier,
      subscription_expires_at = p_expires_at
  where id = p_company_id;
end;
$$;

create or replace function sa_get_all_companies()
returns setof companies language plpgsql security definer as $$
begin return query select * from companies order by created_at desc; end;
$$;

create or replace function get_all_support_tickets()
returns setof support_tickets language plpgsql security definer as $$
begin return query select * from support_tickets order by created_at desc; end;
$$;

create or replace function submit_support_ticket(
  p_category text, p_subject text, p_description text
) returns uuid language plpgsql security definer as $$
declare v_id uuid;
begin
  insert into support_tickets(company_id, submitted_by, category, subject, description)
  values (my_company_id(), auth.uid(), p_category, p_subject, p_description)
  returning id into v_id;
  return v_id;
end;
$$;

-- ══════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ══════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos',      'logos',      true,  5242880,  array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('staff',      'staff',      false, 10485760, array['image/png','image/jpeg','image/webp']),
  ('documents',  'documents',  false, 20971520, array['application/pdf','image/png','image/jpeg']),
  ('room-photos','room-photos',true,  10485760, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

-- Storage policies
create policy "public_logos"    on storage.objects for select using (bucket_id = 'logos');
create policy "company_logos"   on storage.objects for insert with check (bucket_id = 'logos' and auth.uid() is not null);
create policy "public_rooms"    on storage.objects for select using (bucket_id = 'room-photos');
create policy "company_rooms"   on storage.objects for insert with check (bucket_id = 'room-photos' and auth.uid() is not null);
create policy "auth_staff"      on storage.objects for all using (bucket_id = 'staff' and auth.uid() is not null);
create policy "auth_docs"       on storage.objects for all using (bucket_id = 'documents' and auth.uid() is not null);

-- ══════════════════════════════════════════════════════════
-- DONE — OpDesk V2 Schema
-- ══════════════════════════════════════════════════════════
