-- NADANU 3.0 | Fresh standalone voting schema
-- Run ONLY on a newly created Supabase project. Do not mix with the old project.
create extension if not exists pgcrypto;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);
insert into public.categories (slug,name) values
 ('solo-singing','Solo Singing'),('solo-dancing','Solo Dancing'),('group-dancing','Group Dancing')
on conflict (slug) do update set name=excluded.name;

create table public.voting_events (
  id integer primary key check (id = 1),
  status text not null default 'draft' check (status in ('draft','open','closed')),
  starts_at timestamptz,
  ends_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint valid_window check (starts_at is null or ends_at is null or ends_at > starts_at)
);
insert into public.voting_events (id,status) values(1,'draft');

create table public.contestants (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  name text not null check (length(trim(name)) between 1 and 120),
  stage_name text not null default '',
  performance_title text not null default '',
  image_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index contestants_category_order_idx on public.contestants(category_id,sort_order);

create table public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','superadmin'))
);

-- Only the Edge Function's service-role client can insert votes.
-- Unique constraints enforce one vote per browser token AND one vote per anonymous auth user.
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  contestant_id uuid not null references public.contestants(id) on delete cascade,
  voter_id uuid not null unique references auth.users(id) on delete cascade,
  device_hash text not null unique,
  created_at timestamptz not null default now()
);
create index votes_contestant_idx on public.votes(contestant_id);

alter table public.categories enable row level security;
alter table public.voting_events enable row level security;
alter table public.contestants enable row level security;
alter table public.admin_roles enable row level security;
alter table public.votes enable row level security;

create function public.is_voting_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_roles a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_voting_admin() from public;
grant execute on function public.is_voting_admin() to authenticated;

create policy "categories public read" on public.categories for select to anon,authenticated using (true);
create policy "voting status public read" on public.voting_events for select to anon,authenticated using (true);
create policy "event update admins" on public.voting_events for update to authenticated using (public.is_voting_admin()) with check (public.is_voting_admin());
create policy "active contestants public read" on public.contestants for select to anon,authenticated using (active);
create policy "all contestants admin read" on public.contestants for select to authenticated using (public.is_voting_admin());
create policy "contestants insert admins" on public.contestants for insert to authenticated with check (public.is_voting_admin());
create policy "contestants update admins" on public.contestants for update to authenticated using (public.is_voting_admin()) with check (public.is_voting_admin());
create policy "contestants delete admins" on public.contestants for delete to authenticated using (public.is_voting_admin());
create policy "own admin role read" on public.admin_roles for select to authenticated using (user_id=(select auth.uid()));
-- No votes policies: public cannot query counts, read device hashes, or insert votes directly.

create function public.admin_vote_results()
returns table (contestant_id uuid,name text,vote_count bigint)
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_voting_admin() then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  return query
    select c.id,c.name,count(v.id)::bigint
    from public.contestants c
    left join public.votes v on v.contestant_id=c.id
    group by c.id,c.name
    order by count(v.id) desc,c.name;
end;
$$;
revoke all on function public.admin_vote_results() from public;
grant execute on function public.admin_vote_results() to authenticated;

-- Optional: manually create an admin in Supabase Authentication > Users, then:
-- insert into public.admin_roles(user_id,role) values ('YOUR_ADMIN_AUTH_USER_UUID','superadmin');
