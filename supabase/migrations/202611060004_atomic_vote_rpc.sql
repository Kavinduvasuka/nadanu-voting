-- NADANU 3.0: atomic vote checks and insertion in ONE PostgREST RPC.
-- Apply to STAGING first via SQL Editor. Do NOT run in production until validated.
-- SECURITY: only service_role can execute. Browser clients cannot call this.
create or replace function public.cast_vote_atomic(
  p_contestant_id uuid,
  p_voter_id uuid,
  p_device_hash text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.voting_events%rowtype;
begin
  if p_voter_id is null
    or p_contestant_id is null
    or p_device_hash !~ '^[a-f0-9]{64}$' then
    return 'invalid_request';
  end if;

  select * into v_event from public.voting_events where id = 1;
  if not found or v_event.status <> 'open'
    or (v_event.starts_at is not null and v_event.starts_at > now())
    or (v_event.ends_at is not null and v_event.ends_at <= now()) then
    return 'voting_closed';
  end if;

  if not exists (
    select 1 from public.contestants
    where id = p_contestant_id and active is true
  ) then
    return 'finalist_unavailable';
  end if;

  begin
    insert into public.votes(contestant_id, voter_id, device_hash)
    values(p_contestant_id,p_voter_id,p_device_hash);
  exception when unique_violation then
    return 'duplicate';
  end;
  return 'ok';
end;
$$;

revoke all on function public.cast_vote_atomic(uuid,uuid,text) from public;
revoke all on function public.cast_vote_atomic(uuid,uuid,text) from anon;
revoke all on function public.cast_vote_atomic(uuid,uuid,text) from authenticated;
grant execute on function public.cast_vote_atomic(uuid,uuid,text) to service_role;
