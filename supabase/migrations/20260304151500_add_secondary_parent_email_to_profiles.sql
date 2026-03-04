alter table if exists public.profiles
  add column if not exists secondary_parent_email text;

create unique index if not exists profiles_secondary_parent_email_unique_idx
  on public.profiles (lower(secondary_parent_email))
  where secondary_parent_email is not null;

create or replace function public.can_manage_students(target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_email text;
begin
  if auth.uid() = target_user_id then
    return true;
  end if;

  requester_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if requester_email = '' then
    return false;
  end if;

  return exists (
    select 1
    from public.profiles p
    where p.id = target_user_id
      and lower(coalesce(p.secondary_parent_email, '')) = requester_email
  );
end;
$$;

grant execute on function public.can_manage_students(uuid) to authenticated;

drop policy if exists "students_owner_all" on public.students;
create policy "students_owner_all"
on public.students
for all
using (public.can_manage_students(user_id))
with check (public.can_manage_students(user_id));
