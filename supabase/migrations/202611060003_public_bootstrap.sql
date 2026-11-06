-- Nadanu 3.0: one read-only RPC replaces three separate homepage requests.
-- SECURITY INVOKER preserves all existing RLS policies; exposes no votes or admin data.
CREATE OR REPLACE FUNCTION public.public_voting_bootstrap()
RETURNS jsonb
LANGUAGE sql STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'categories', COALESCE((
      SELECT jsonb_agg(to_jsonb(c))
      FROM (SELECT id, slug, name FROM public.categories ORDER BY name) AS c
    ), '[]'::jsonb),
    'contestants', COALESCE((
      SELECT jsonb_agg(to_jsonb(c))
      FROM (
        SELECT id, name, stage_name, performance_title, image_url, sort_order, category_id
        FROM public.contestants
        WHERE active = true
        ORDER BY sort_order, id
      ) AS c
    ), '[]'::jsonb),
    'event', (
      SELECT to_jsonb(e)
      FROM (
        SELECT id, status, starts_at, ends_at
        FROM public.voting_events
        WHERE id = 1
      ) AS e
    )
  );
$$;

REVOKE ALL ON FUNCTION public.public_voting_bootstrap() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_voting_bootstrap() TO anon, authenticated;
