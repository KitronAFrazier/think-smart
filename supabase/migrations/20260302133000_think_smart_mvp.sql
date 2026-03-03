-- Think Smart MVP schema + RLS

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  grade_level text not null,
  avatar_text text,
  xp integer not null default 0,
  streak integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  title text not null,
  subject text not null,
  description text,
  start_date date,
  due_date date,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_plan_id uuid references public.lesson_plans(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  title text not null,
  subject text not null,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('present', 'absent', 'excused')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, student_id, attendance_date)
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  subject text not null,
  assignment_title text not null,
  score_percent integer not null check (score_percent >= 0 and score_percent <= 100),
  letter_grade text not null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  url text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  event_type text not null default 'event',
  location text,
  event_date timestamptz not null,
  seats integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'family', 'family_plus')),
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_students_user_id on public.students(user_id);
create index if not exists idx_subjects_user_id on public.subjects(user_id);
create index if not exists idx_lesson_plans_user_id on public.lesson_plans(user_id);
create index if not exists idx_assignments_user_id on public.assignments(user_id);
create index if not exists idx_attendance_user_id on public.attendance(user_id);
create index if not exists idx_progress_user_id on public.progress(user_id);
create index if not exists idx_saved_resources_user_id on public.saved_resources(user_id);
create index if not exists idx_community_posts_user_id on public.community_posts(user_id);
create index if not exists idx_events_user_id on public.events(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_students_updated_at before update on public.students for each row execute procedure public.set_updated_at();
create trigger set_subjects_updated_at before update on public.subjects for each row execute procedure public.set_updated_at();
create trigger set_lesson_plans_updated_at before update on public.lesson_plans for each row execute procedure public.set_updated_at();
create trigger set_assignments_updated_at before update on public.assignments for each row execute procedure public.set_updated_at();
create trigger set_attendance_updated_at before update on public.attendance for each row execute procedure public.set_updated_at();
create trigger set_progress_updated_at before update on public.progress for each row execute procedure public.set_updated_at();
create trigger set_saved_resources_updated_at before update on public.saved_resources for each row execute procedure public.set_updated_at();
create trigger set_community_posts_updated_at before update on public.community_posts for each row execute procedure public.set_updated_at();
create trigger set_events_updated_at before update on public.events for each row execute procedure public.set_updated_at();
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'inactive')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.lesson_plans enable row level security;
alter table public.assignments enable row level security;
alter table public.attendance enable row level security;
alter table public.progress enable row level security;
alter table public.saved_resources enable row level security;
alter table public.community_posts enable row level security;
alter table public.events enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "students_owner_all" on public.students for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subjects_owner_all" on public.subjects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_plans_owner_all" on public.lesson_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assignments_owner_all" on public.assignments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "attendance_owner_all" on public.attendance for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_owner_all" on public.progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "saved_resources_owner_all" on public.saved_resources for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "community_posts_owner_all" on public.community_posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "events_owner_all" on public.events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subscriptions_owner_all" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
