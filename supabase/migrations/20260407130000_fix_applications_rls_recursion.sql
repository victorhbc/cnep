-- Break RLS cycle: INSERT applications -> WITH CHECK reads profiles ->
-- profiles_select_applicants subquery reads applications -> infinite recursion.
-- SECURITY DEFINER reads applications/jobs without re-entering RLS.

CREATE OR REPLACE FUNCTION public.empresa_sees_applicant_via_application(p_empresa uuid, p_applicant uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.applications a
    INNER JOIN public.jobs j ON j.id = a.job_id
    WHERE a.user_id = p_applicant
      AND j.empresa_id = p_empresa
  );
$$;

REVOKE ALL ON FUNCTION public.empresa_sees_applicant_via_application(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.empresa_sees_applicant_via_application(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "profiles_select_applicants" ON public.profiles;
CREATE POLICY "profiles_select_applicants"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.empresa_sees_applicant_via_application(auth.uid(), profiles.user_id));

DROP POLICY IF EXISTS "curriculos_select_employer_applicant" ON storage.objects;
CREATE POLICY "curriculos_select_employer_applicant"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'curriculos'
    AND public.empresa_sees_applicant_via_application(
      auth.uid(),
      (split_part(name, '/', 1))::uuid
    )
  );
