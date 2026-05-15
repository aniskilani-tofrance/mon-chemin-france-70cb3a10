-- Revoke EXECUTE from PUBLIC/anon/authenticated for all SECURITY DEFINER helpers,
-- then grant back only what's needed for RLS / RPC usage.

-- Trigger functions (never called from API)
REVOKE EXECUTE ON FUNCTION public.protect_purchased_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_afest_appreciation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_lead_price() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Internal helpers (only called from other functions)
REVOKE EXECUTE ON FUNCTION public.normalize_marianne_access_code(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_access_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_lead_price(public.certification_type) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_lead_price_scored(public.certification_type, integer) FROM PUBLIC, anon, authenticated;

-- RLS helpers: authenticated needs EXECUTE so policies can evaluate
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_formateur_for(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_formateur_for(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.can_access_provider(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_provider(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_provider_owner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_provider_owner(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_provider_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_provider_member(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_provider_for_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_provider_for_profile(uuid) TO authenticated;

-- Public RPCs (Marianne access code) need anon access
REVOKE EXECUTE ON FUNCTION public.check_marianne_access_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_marianne_access_code(text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.validate_marianne_access_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_marianne_access_code(text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.validate_marianne_access_code(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_marianne_access_code(text, text, text) TO anon, authenticated;

-- Authenticated-only RPC
REVOKE EXECUTE ON FUNCTION public.score_shared_diagnostic_competences(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.score_shared_diagnostic_competences(uuid) TO authenticated;
