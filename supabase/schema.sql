-- Enable UUID
create extension if not exists "uuid-ossp";

do $$ begin
  create type app_role as enum ('admin', 'organizer', 'seller');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type event_status as enum ('draft', 'published', 'closed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type order_status as enum ('pending', 'paid', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type ticket_status as enum ('active', 'used', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role app_role not null default 'seller',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  venue text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status event_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  price integer not null check (price > 0),
  quantity integer not null check (quantity > 0),
  sold_quantity integer not null default 0 check (sold_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists seller_event_assignments (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (seller_id, event_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  buyer_name text not null,
  buyer_email text not null,
  quantity integer not null check (quantity > 0),
  total_amount integer not null check (total_amount >= 0),
  status order_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  ticket_type_id uuid not null references ticket_types(id),
  event_id uuid not null references events(id),
  qr_code text not null unique,
  status ticket_status not null default 'active',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table events enable row level security;
alter table ticket_types enable row level security;
alter table seller_event_assignments enable row level security;
alter table orders enable row level security;
alter table tickets enable row level security;

create or replace function is_admin(user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles where id = user_id and role = 'admin'
  );
$$;

create policy "profiles self or admin"
on profiles
for select
using (auth.uid() = id or is_admin(auth.uid()));

create policy "profiles update self"
on profiles
for update
using (auth.uid() = id);

create policy "events public read published"
on events
for select
using (status = 'published' or is_admin(auth.uid()) or organizer_id = auth.uid());

create policy "organizer create event"
on events
for insert
with check (organizer_id = auth.uid());

create policy "organizer update own event"
on events
for update
using (organizer_id = auth.uid() or is_admin(auth.uid()));

create policy "ticket types read by owner and assigned seller"
on ticket_types
for select
using (
  is_admin(auth.uid())
  or exists (select 1 from events e where e.id = event_id and e.organizer_id = auth.uid())
  or exists (
    select 1 from seller_event_assignments sea
    where sea.event_id = ticket_types.event_id and sea.seller_id = auth.uid()
  )
);

create policy "organizer manage ticket types"
on ticket_types
for all
using (
  is_admin(auth.uid())
  or exists (select 1 from events e where e.id = event_id and e.organizer_id = auth.uid())
)
with check (
  is_admin(auth.uid())
  or exists (select 1 from events e where e.id = event_id and e.organizer_id = auth.uid())
);

create policy "seller assignments read own"
on seller_event_assignments
for select
using (seller_id = auth.uid() or is_admin(auth.uid()));

create policy "admin manage assignments"
on seller_event_assignments
for all
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

create policy "orders read own access"
on orders
for select
using (
  is_admin(auth.uid())
  or seller_id = auth.uid()
  or exists (select 1 from events e where e.id = event_id and e.organizer_id = auth.uid())
);

create policy "seller create order"
on orders
for insert
with check (seller_id = auth.uid());

create policy "tickets read linked access"
on tickets
for select
using (
  is_admin(auth.uid())
  or exists (select 1 from orders o where o.id = order_id and o.seller_id = auth.uid())
  or exists (select 1 from events e where e.id = event_id and e.organizer_id = auth.uid())
);

create policy "seller create ticket"
on tickets
for insert
with check (
  exists (select 1 from orders o where o.id = order_id and o.seller_id = auth.uid())
);
