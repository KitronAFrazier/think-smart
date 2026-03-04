alter table if exists public.profiles
  add column if not exists secondary_parent_email text;
