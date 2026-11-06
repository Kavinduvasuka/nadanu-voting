-- Nadanu 3.0: secure administration of vote records.
-- Run once in Supabase SQL Editor before enabling the new dashboard feature.

CREATE TABLE IF NOT EXISTS public.vote_reset_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid NOT NULL,
  contestant_id uuid NOT NULL,
  voter_id uuid NOT NULL,
  device_hash text NOT NULL,
  reset_by uuid NOT NULL REFERENCES auth.users(id),
  reset_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vote_reset_audit ENABLE ROW LEVEL SECURITY;
-- There are intentionally no public/client RLS policies on audit records.

-- Anonymous and ordinary users must never read voter identifiers.
CREATE OR REPLACE FUNCTION public.admin_list_voter_records()
RETURNS TABLE (
  vote_id uuid,
  finalist_name text,
  voted_at timestamptz,
  device_reference text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_voting_admin() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501';
  END IF;

  RETURN QUERY
  SELECT v.id, c.name, v.created_at,
         left(v.device_hash, 12) || '…'
  FROM public.votes v
  JOIN public.contestants c ON c.id=v.contestant_id
  ORDER BY v.created_at DESC
  LIMIT 500;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_voter_records() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_voter_records() TO authenticated;

-- This RPC is accessible ONLY by service_role, not by an ordinary browser.
-- Atomic delete + audit record. Edge Function verifies fresh admin password first.
CREATE OR REPLACE FUNCTION public.admin_reset_one_vote(
  p_vote_id uuid, p_admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v public.votes%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_roles a
    WHERE a.user_id=p_admin_id
  ) THEN
    RAISE EXCEPTION 'Not an organizer' USING ERRCODE='42501';
  END IF;

  DELETE FROM public.votes
  WHERE id=p_vote_id
  RETURNING * INTO v;

  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO public.vote_reset_audit
    (vote_id, contestant_id, voter_id, device_hash, reset_by)
  VALUES
    (v.id, v.contestant_id, v.voter_id, v.device_hash, p_admin_id);

  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_reset_one_vote(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_reset_one_vote(uuid,uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reset_one_vote(uuid,uuid) TO service_role;
