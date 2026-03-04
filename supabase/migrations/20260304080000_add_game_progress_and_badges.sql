create table if not exists public.game_progress (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references public."Student"(id) on delete cascade,
  game_id text not null,
  xp_total integer not null default 0,
  level integer not null default 1,
  daily_streak integer not null default 1,
  last_played_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, game_id)
);

create index if not exists idx_game_progress_student_updated
  on public.game_progress (student_id, updated_at desc);

create table if not exists public.game_badges (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references public."Student"(id) on delete cascade,
  game_id text not null,
  badge_key text not null,
  unlocked_at timestamptz not null default now(),
  unique (student_id, game_id, badge_key)
);

create index if not exists idx_game_badges_student_game
  on public.game_badges (student_id, game_id);
