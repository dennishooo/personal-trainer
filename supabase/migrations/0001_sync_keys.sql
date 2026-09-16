-- Widens the user_state key whitelist to every store in SYNC_KEYS.
--
-- The original schema allowed only 'plan' and 'picks', so the eating-out log,
-- custom dishes and the workout log were all rejected at write time with
-- "violates check constraint user_state_key_check". Run this once in the
-- Supabase SQL editor against an existing database; supabase/schema.sql
-- already has the widened constraint for a fresh setup.

alter table public.user_state
  drop constraint if exists user_state_key_check;

alter table public.user_state
  add constraint user_state_key_check
  check (key in ('plan', 'picks', 'dishLog', 'customDishes', 'workoutLog'));
