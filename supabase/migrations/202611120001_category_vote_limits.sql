-- One verified vote per category, per anonymous user AND per browser hash.
-- Preserves existing votes. Existing votes are assigned to the contestant's category.
-- SECURITY: category_id is always derived from the contestant on the database server.

alter table public.votes
  add column if not exists category_id uuid;

update public.votes v
set category_id = c.category_id
from public.contestants c
where v.contestant_id = c.id and v.category_id is distinct from c.category_id;

alter table public.votes
  alter column category_id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.votes'::regclass
      and conname = 'votes_category_id_fkey'
  ) then
    alter table public.votes
      add constraint votes_category_id_fkey
      foreign key (category_id) references public.categories(id);
  end if;
end $$;

create or replace function public.set_vote_category()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_category uuid;
begin
  select c.category_id into v_category
  from public.contestants c
  where c.id = new.contestant_id;
  if v_category is null then
    raise exception 'Invalid finalist category';
  end if;
  new.category_id := v_category;
  return new;
end;
$$;

drop trigger if exists votes_set_category on public.votes;
create trigger votes_set_category
before insert or update of contestant_id, category_id on public.votes
for each row execute function public.set_vote_category();

-- Prevent an already-voted finalist being moved across categories.
create or replace function public.prevent_voted_finalist_category_move()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.category_id is distinct from new.category_id
     and exists (select 1 from public.votes where contestant_id = old.id) then
    raise exception 'Cannot change the category of a finalist with recorded votes';
  end if;
  return new;
end;
$$;

drop trigger if exists contestants_protect_voted_category on public.contestants;
create trigger contestants_protect_voted_category
before update of category_id on public.contestants
for each row execute function public.prevent_voted_finalist_category_move();

-- Replace event-wide uniqueness with category-scoped uniqueness.
alter table public.votes drop constraint if exists votes_voter_id_key;
alter table public.votes drop constraint if exists votes_device_hash_key;
create unique index if not exists votes_voter_category_key
  on public.votes (voter_id, category_id);
create unique index if not exists votes_device_category_key
  on public.votes (device_hash, category_id);

-- The new index covers lookups by the leading voter_id; device_hash index covers device lookups.
create index if not exists votes_category_id_idx on public.votes(category_id);

-- SECURITY NOTE: public votes RLS and admin report/reset RPCs stay unchanged.
