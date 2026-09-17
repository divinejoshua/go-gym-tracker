-- Allow a workout to be recorded without proof.
--
-- Workouts that happened before the app existed have no photo or video, and by
-- the time they get backfilled nobody remembers the venue or how long it took.
-- Make those columns nullable so a past session can be logged as just a person,
-- a date and a type. Live posts through /post still send all of them.
--
-- Safe to run twice: every step checks whether it still applies.

alter table gogym_workouts alter column media_url  drop not null;
alter table gogym_workouts alter column media_type drop not null;
alter table gogym_workouts alter column duration   drop not null;

-- The existing `media_type in ('image','video')` and `duration in (...)` checks
-- already pass on NULL — a CHECK only fails when it evaluates to false — so they
-- stay as they are. This one keeps the pair honest: a row has both halves of its
-- proof or neither, never a URL with no type to render it with.
alter table gogym_workouts drop constraint if exists gogym_workouts_proof_paired;
alter table gogym_workouts
  add constraint gogym_workouts_proof_paired
  check ((media_url is null) = (media_type is null));
