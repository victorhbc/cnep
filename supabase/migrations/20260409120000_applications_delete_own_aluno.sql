-- Students may withdraw (delete) their own application.
CREATE POLICY "applications_delete_own_aluno"
  ON public.applications FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'aluno'
    )
  );
