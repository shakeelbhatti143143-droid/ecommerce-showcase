-- Run this once in the Supabase SQL Editor. Passwords are hashed, never stored as readable text.
create extension if not exists pgcrypto;
create table if not exists public.login (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null unique,
  password text not null, created_at timestamptz not null default now()
);
alter table public.login enable row level security;
revoke all on table public.login from anon, authenticated;
drop function if exists public.create_shop_login(text, text, text);
drop function if exists public.verify_shop_login(text, text);
create or replace function public.create_shop_login(account_email text, account_name text, account_password text) returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare new_login public.login;
begin
  if length(trim(account_name)) < 2 then raise exception 'Please enter your name'; end if;
  if account_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Please enter a valid email address'; end if;
  if length(account_password) < 6 then raise exception 'Password must be at least 6 characters'; end if;
  insert into public.login (name, email, password) values (trim(account_name), lower(trim(account_email)), crypt(account_password, gen_salt('bf'))) returning * into new_login;
  return jsonb_build_object('id', new_login.id, 'name', new_login.name, 'email', new_login.email);
exception when unique_violation then raise exception 'An account with this email already exists'; end;
$$;
create or replace function public.verify_shop_login(account_email text, account_password text) returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare matching_login public.login;
begin
  select * into matching_login from public.login where email = lower(trim(account_email)) and password = crypt(account_password, password);
  if matching_login.id is null then raise exception 'Incorrect email or password'; end if;
  return jsonb_build_object('id', matching_login.id, 'name', matching_login.name, 'email', matching_login.email);
end;
$$;
revoke all on function public.create_shop_login(text, text, text) from public;
revoke all on function public.verify_shop_login(text, text) from public;
grant execute on function public.create_shop_login(text, text, text) to anon, authenticated;
grant execute on function public.verify_shop_login(text, text) to anon, authenticated;

-- Make the new RPC functions available to the Supabase API immediately.
notify pgrst, 'reload schema';

-- Verification: this must return one row after the script runs.
select routine_name, specific_name
from information_schema.routines
where routine_schema = 'public' and routine_name in ('create_shop_login', 'verify_shop_login');
