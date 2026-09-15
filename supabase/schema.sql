-- Go Gym or Go Broke — database schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
--
-- Every table is prefixed `gogym_` so this app's tables stay identifiable in a
-- project that hosts more than one app. If you already created the unprefixed
-- tables, run supabase/migrations/001_prefix_tables.sql instead — it renames
-- them in place and keeps your data.

-- ---------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------

create table if not exists gogym_challenges (
  id                uuid primary key default gen_random_uuid(),
  name              text        not null,
  workouts_per_week int         not null check (workouts_per_week between 1 and 14),
  rules             text        not null default '',
  start_date        date        not null,
  end_date          date        not null,
  created_at        timestamptz not null default now(),
  constraint gogym_challenge_dates_ordered check (end_date >= start_date)
);

create table if not exists gogym_participants (
  id           uuid primary key default gen_random_uuid(),
  challenge_id uuid        not null references gogym_challenges(id) on delete cascade,
  name         text        not null,
  created_at   timestamptz not null default now(),
  -- one person can only be listed once per challenge
  unique (challenge_id, name)
);

create table if not exists gogym_workouts (
  id             uuid        primary key default gen_random_uuid(),
  challenge_id   uuid        not null references gogym_challenges(id) on delete cascade,
  participant_id uuid        not null references gogym_participants(id) on delete cascade,
  media_url      text        not null,
  media_type     text        not null check (media_type in ('image', 'video')),
  workout_type   text        not null check (workout_type in ('upper_body', 'leg_day', 'cardio', 'other')),
  duration       text        not null check (duration in ('30m', '45m', '1h', '2h', '3h+')),
  routine        text        not null default '',
  venue          text        not null default '',
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Indexes — the feed and the weekly scoreboard are the hot paths
-- ---------------------------------------------------------------

create index if not exists gogym_workouts_created_at_idx        on gogym_workouts (created_at desc);
create index if not exists gogym_workouts_challenge_created_idx on gogym_workouts (challenge_id, created_at desc);
create index if not exists gogym_workouts_participant_idx       on gogym_workouts (participant_id, created_at desc);
create index if not exists gogym_participants_challenge_idx     on gogym_participants (challenge_id);

-- ---------------------------------------------------------------
-- Row Level Security
--
-- Every read and write goes through the Next.js server using the service role
-- key, which bypasses RLS. So we enable RLS and add no policies at all: the
-- `anon` key is left with zero access to these tables. If someone ever finds
-- your project URL, there is nothing for them to read or write.
-- ---------------------------------------------------------------

alter table gogym_challenges   enable row level security;
alter table gogym_participants enable row level security;
alter table gogym_workouts     enable row level security;

-- ---------------------------------------------------------------
-- Storage bucket for workout proof (photos + videos)
--
-- Reads are public because phones load the images and videos straight from
-- Supabase. Paths carry a random UUID, so they are effectively unguessable.
-- Writes stay closed: uploads arrive via /api/upload using the service role.
-- ---------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do update set public = true;

drop policy if exists "public upload proofs" on storage.objects;
drop policy if exists "public read proofs"   on storage.objects;

create policy "public read proofs"
  on storage.objects for select
  using (bucket_id = 'proofs');
