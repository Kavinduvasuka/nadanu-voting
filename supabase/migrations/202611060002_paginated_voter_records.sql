-- Nadanu 3.0: paginated admin voter records for large voting events.
-- Each admin request fetches at most 26 rows (25 displayed + 1 has-more marker).
-- Leaves existing admin_list_voter_records() untouched for compatibility.
CREATE INDEX IF NOT EXISTS votes_created_at_id_desc_idx
  ON public.votes (created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION public.admin_list_voter_records_page(
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 25
)
RETURNS TABLE (
  vote_id uuid,
  finalist_name text,
  voted_at timestamptz,
  device_reference text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_voting_admin() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501';
  END IF;
  IF p_offset IS NULL OR p_offset < 0 OR p_offset > 1000000
     OR p_limit IS NULL OR p_limit < 1 OR p_limit > 50 THEN
    RAISE EXCEPTION 'Invalid pagination' USING ERRCODE='22023';
  END IF;

  RETURN QUERY
    SELECT v.id, c.name, v.created_at,
           left(v.device_hash, 12) || '…'
    FROM public.votes AS v
    JOIN public.contestants AS c ON c.id=v.contestant_id
    ORDER BY v.created_at DESC, v.id DESC
    LIMIT p_limit + 1
    OFFSET p_offset;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_voter_records_page(integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_voter_records_page(integer,integer) TO authenticated;
