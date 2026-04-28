REVOKE EXECUTE ON FUNCTION public.score_shared_diagnostic_competences(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.score_shared_diagnostic_competences(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.score_shared_diagnostic_competences(UUID) TO authenticated;