-- Public results remain private until BOTH the event is closed and an organizer enables the chart.
ALTER TABLE public.voting_events
  ADD COLUMN IF NOT EXISTS show_results_chart boolean NOT NULL DEFAULT false;

-- Never allow an enabled chart for an open/draft event, including when reopening.
CREATE OR REPLACE FUNCTION public.guard_public_chart_visibility()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.status <> 'closed' THEN
    NEW.show_results_chart := false;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS voting_events_chart_visibility_guard ON public.voting_events;
CREATE TRIGGER voting_events_chart_visibility_guard
BEFORE INSERT OR UPDATE ON public.voting_events
FOR EACH ROW EXECUTE FUNCTION public.guard_public_chart_visibility();

-- SECURITY DEFINER reads hidden votes but ONLY returns aggregated totals when publication is authorized.
-- Never expose raw voter IDs, device hashes, or unpublished tallies.
CREATE OR REPLACE FUNCTION public.public_closed_vote_results()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.voting_events
    WHERE id = 1 AND status = 'closed' AND show_results_chart = true
  ) THEN
    RETURN NULL;
  END IF;
  SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.category_name, t.vote_count DESC, t.finalist_name), '[]'::jsonb)
  INTO result
  FROM (
    SELECT cat.name AS category_name, cat.slug AS category_slug,
           c.name AS finalist_name, count(v.id)::bigint AS vote_count,
           c.id AS contestant_id
    FROM public.contestants c
    JOIN public.categories cat ON cat.id = c.category_id
    LEFT JOIN public.votes v ON v.contestant_id = c.id
    GROUP BY cat.name, cat.slug, c.name, c.id
  ) t;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.public_closed_vote_results() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_closed_vote_results() TO anon, authenticated;
