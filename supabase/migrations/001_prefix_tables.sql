-- Rename the original unprefixed tables to the `gogym_` prefix, in place.
--
-- Run this ONLY if you already created challenges/participants/workouts with
-- an earlier version of schema.sql. It keeps every row, and Postgres carries
-- indexes, constraints, foreign keys and RLS settings across a rename
-- automatically — this just brings their *names* along too, so nothing is left
-- looking like it belongs to the old schema.
--
-- Safe to run twice: every step checks whether it still applies.

do $$
begin
  if to_regclass('public.challenges') is not null then
    alter table challenges rename to gogym_challenges;
  end if;

  if to_regclass('public.participants') is not null then
    alter table participants rename to gogym_participants;
  end if;

  if to_regclass('public.workouts') is not null then
    alter table workouts rename to gogym_workouts;
  end if;
end $$;

-- Indexes keep their old names after a table rename; line them up.
alter index if exists workouts_created_at_idx        rename to gogym_workouts_created_at_idx;
alter index if exists workouts_challenge_created_idx rename to gogym_workouts_challenge_created_idx;
alter index if exists workouts_participant_idx       rename to gogym_workouts_participant_idx;
alter index if exists participants_challenge_idx     rename to gogym_participants_challenge_idx;

-- Same for the date-ordering check constraint.
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'challenge_dates_ordered'
  ) then
    alter table gogym_challenges
      rename constraint challenge_dates_ordered to gogym_challenge_dates_ordered;
  end if;
end $$;

-- Drop the permissive policies an early version of schema.sql created. All
-- access now goes through the server's service role key, which bypasses RLS.
drop policy if exists "public read challenges"     on gogym_challenges;
drop policy if exists "public insert challenges"   on gogym_challenges;
drop policy if exists "public read participants"   on gogym_participants;
drop policy if exists "public insert participants" on gogym_participants;
drop policy if exists "public read workouts"       on gogym_workouts;
drop policy if exists "public insert workouts"     on gogym_workouts;

alter table gogym_challenges   enable row level security;
alter table gogym_participants enable row level security;
alter table gogym_workouts     enable row level security;
