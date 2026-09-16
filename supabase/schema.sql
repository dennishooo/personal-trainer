-- Personal Plan sync schema. Run once in the Supabase SQL editor.
--
-- One JSONB row per user per store — last write wins. The key whitelist below
-- must list every entry in SYNC_KEYS (src/lib/sync.ts); a key missing here is
-- rejected at write time by user_state_key_check, not at build time.
-- Row-level security is the whole access model: users can only touch rows
-- whose user_id is their own auth id, enforced by the database.
--
-- Also do these two things in the dashboard:
--   1. Auth → URL Configuration: set the Site URL to the deployed app
--      (e.g. https://<user>.github.io/personal-trainer/) so magic links land
--      back on the app. Add http://localhost:5173 to Redirect URLs for dev.
--   2. Auth → Providers: Email is on by default; magic links need no more.

create table public.user_state (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  key        text        not null check (key in ('plan', 'picks', 'dishLog', 'customDishes', 'workoutLog')),
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_state enable row level security;

create policy "Users manage only their own state"
  on public.user_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
