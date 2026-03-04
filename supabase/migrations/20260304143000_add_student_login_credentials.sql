alter table if exists public.students
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists login_username text;

create unique index if not exists students_login_username_unique_idx
  on public.students (lower(login_username))
  where login_username is not null;
