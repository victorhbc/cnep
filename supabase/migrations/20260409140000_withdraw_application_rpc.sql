-- Withdraw own application without depending on PostgREST DELETE + RLS
-- (still enforces: same user, role aluno).
CREATE OR REPLACE FUNCTION public.withdraw_application(p_job_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  DELETE FROM public.applications
  WHERE job_id = p_job_id
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'aluno'
    );
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.withdraw_application(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.withdraw_application(uuid) TO authenticated;
