-- One-off: record workouts that happened before the app existed.
--
-- Run supabase/migrations/002_optional_proof.sql FIRST. These rows carry no
-- media, venue or duration, which the original NOT NULL columns would reject.
--
-- Paste into the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to run twice: the `not exists` guard skips anyone who already has a
-- workout logged on that day, so a second run inserts nothing.
--
-- To add more, copy a row into the `values` list below. People and challenges
-- are matched by name, so there are no UUIDs to look up.
--
-- The time of day is midday on purpose. `created_at` is a timestamptz and the
-- feed buckets it into days in the server's local zone (see lib/dates.ts), so
-- midday keeps the workout on the right date wherever the app is deployed.

with entries (challenge_name, participant_name, workout_type, routine, happened_at) as (
  values
    ('Test challenge'::text, 'Me'::text, 'upper_body'::text, E'Pullup\nPress up'::text, timestamptz '2026-09-13 12:00:00+01')
)
insert into gogym_workouts
  (challenge_id, participant_id, workout_type, routine, created_at,
   media_url, media_type, duration, venue)
select
  c.id,
  p.id,
  e.workout_type,
  e.routine,
  e.happened_at,
  null,  -- no photo or video: this one predates the app
  null,
  null,  -- length not recorded
  ''     -- venue not recorded
from entries e
join gogym_challenges   c on c.name = e.challenge_name
join gogym_participants p on p.challenge_id = c.id and p.name = e.participant_name
where not exists (
  select 1
  from gogym_workouts w
  where w.participant_id = p.id
    and w.created_at >= date_trunc('day', e.happened_at)
    and w.created_at <  date_trunc('day', e.happened_at) + interval '1 day'
);
