-- Think Smart master schema (source of truth)
-- Use this file in Supabase SQL Editor when you want a single upload/update script.

create extension if not exists pgcrypto;

-- Compatibility fixes for older schemas before table creation logic.
do $$
begin
  if to_regclass('public.profiles') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'user_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'id'
    ) then
      execute 'alter table public.profiles rename column user_id to id';
    end if;
  end if;

  if to_regclass('public.students') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'students' and column_name = 'owner_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'students' and column_name = 'user_id'
    ) then
      execute 'alter table public.students rename column owner_id to user_id';
    end if;
  end if;

  if to_regclass('public.subjects') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'subjects' and column_name = 'owner_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'subjects' and column_name = 'user_id'
    ) then
      execute 'alter table public.subjects rename column owner_id to user_id';
    end if;
  end if;

  if to_regclass('public.lesson_plans') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'lesson_plans' and column_name = 'owner_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'lesson_plans' and column_name = 'user_id'
    ) then
      execute 'alter table public.lesson_plans rename column owner_id to user_id';
    end if;
  end if;

  if to_regclass('public.assignments') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'assignments' and column_name = 'owner_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'assignments' and column_name = 'user_id'
    ) then
      execute 'alter table public.assignments rename column owner_id to user_id';
    end if;
  end if;

  if to_regclass('public.attendance') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'attendance' and column_name = 'owner_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'attendance' and column_name = 'user_id'
    ) then
      execute 'alter table public.attendance rename column owner_id to user_id';
    end if;
  end if;

  if to_regclass('public.progress') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'progress' and column_name = 'owner_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'progress' and column_name = 'user_id'
    ) then
      execute 'alter table public.progress rename column owner_id to user_id';
    end if;
  end if;

  if to_regclass('public.saved_resources') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'saved_resources' and column_name = 'owner_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'saved_resources' and column_name = 'user_id'
    ) then
      execute 'alter table public.saved_resources rename column owner_id to user_id';
    end if;
  end if;

  if to_regclass('public.community_posts') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'community_posts' and column_name = 'owner_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'community_posts' and column_name = 'user_id'
    ) then
      execute 'alter table public.community_posts rename column owner_id to user_id';
    end if;
  end if;

  if to_regclass('public.events') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'events' and column_name = 'owner_id'
    ) and not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'events' and column_name = 'user_id'
    ) then
      execute 'alter table public.events rename column owner_id to user_id';
    end if;
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'parent' check (role in ('parent', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists id uuid;

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

alter table public.students add column if not exists user_id uuid;
do $$
begin
  if to_regclass('public.subjects') is not null then
    execute 'alter table public.subjects add column if not exists user_id uuid';
  end if;
  if to_regclass('public.lesson_plans') is not null then
    execute 'alter table public.lesson_plans add column if not exists user_id uuid';
  end if;
  if to_regclass('public.assignments') is not null then
    execute 'alter table public.assignments add column if not exists user_id uuid';
  end if;
  if to_regclass('public.attendance') is not null then
    execute 'alter table public.attendance add column if not exists user_id uuid';
  end if;
  if to_regclass('public.progress') is not null then
    execute 'alter table public.progress add column if not exists user_id uuid';
  end if;
  if to_regclass('public.saved_resources') is not null then
    execute 'alter table public.saved_resources add column if not exists user_id uuid';
  end if;
  if to_regclass('public.community_posts') is not null then
    execute 'alter table public.community_posts add column if not exists user_id uuid';
  end if;
  if to_regclass('public.events') is not null then
    execute 'alter table public.events add column if not exists user_id uuid';
  end if;
end $$;

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

alter table public.profiles
add column if not exists role text not null default 'parent' check (role in ('parent', 'admin'));

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

drop trigger if exists set_profiles_updated_at on public.profiles;
drop trigger if exists set_students_updated_at on public.students;
drop trigger if exists set_subjects_updated_at on public.subjects;
drop trigger if exists set_lesson_plans_updated_at on public.lesson_plans;
drop trigger if exists set_assignments_updated_at on public.assignments;
drop trigger if exists set_attendance_updated_at on public.attendance;
drop trigger if exists set_progress_updated_at on public.progress;
drop trigger if exists set_saved_resources_updated_at on public.saved_resources;
drop trigger if exists set_community_posts_updated_at on public.community_posts;
drop trigger if exists set_events_updated_at on public.events;
drop trigger if exists set_subscriptions_updated_at on public.subscriptions;

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

create or replace function public.enforce_profiles_admin_identity()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  profile_auth_user_id uuid;
begin
  profile_auth_user_id := coalesce(
    nullif(to_jsonb(new)->>'id', '')::uuid,
    nullif(to_jsonb(new)->>'user_id', '')::uuid
  );

  if new.role = 'admin'
     and not exists (
       select 1
       from auth.users u
       where u.id = profile_auth_user_id
         and lower(u.email) = 'frazier.kitron@gmail.com'
     ) then
    raise exception 'Only the approved admin account can have admin role';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_profiles_admin_identity_trigger on public.profiles;
create trigger enforce_profiles_admin_identity_trigger
before insert or update on public.profiles
for each row execute procedure public.enforce_profiles_admin_identity();

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

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "students_owner_all" on public.students;
drop policy if exists "subjects_owner_all" on public.subjects;
drop policy if exists "lesson_plans_owner_all" on public.lesson_plans;
drop policy if exists "assignments_owner_all" on public.assignments;
drop policy if exists "attendance_owner_all" on public.attendance;
drop policy if exists "progress_owner_all" on public.progress;
drop policy if exists "saved_resources_owner_all" on public.saved_resources;
drop policy if exists "community_posts_owner_all" on public.community_posts;
drop policy if exists "events_owner_all" on public.events;
drop policy if exists "subscriptions_owner_all" on public.subscriptions;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (
    select p.role
    from public.profiles p
    where p.id = auth.uid()
  )
);

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

-- Promote an account to admin:
-- update public.profiles set role = 'admin' where id = '<USER_UUID>';
