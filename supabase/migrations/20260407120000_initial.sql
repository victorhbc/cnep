-- CENEP Conecta — schema, RLS, storage policies
-- SQL Editor, ou após `supabase link`: npm run db:push

-- Profiles (1:1 with auth.users)
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('aluno', 'empresa')),
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  cpf TEXT,
  telefone TEXT,
  curso TEXT,
  experiencia TEXT,
  curriculo_url TEXT,
  empresa_nome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo_funcao TEXT NOT NULL DEFAULT 'Geral',
  empresa_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  empresa_nome TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'aplicado' CHECK (status IN ('aplicado', 'em_analise', 'aprovado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, user_id)
);

CREATE INDEX idx_jobs_empresa ON public.jobs (empresa_id);
CREATE INDEX idx_jobs_tipo_funcao ON public.jobs (tipo_funcao);
CREATE INDEX idx_applications_job ON public.applications (job_id);
CREATE INDEX idx_applications_user ON public.applications (user_id);

-- Auto-create profile on signup (reads raw_user_meta_data)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r TEXT;
BEGIN
  r := COALESCE(NEW.raw_user_meta_data->>'role', 'aluno');
  IF r NOT IN ('aluno', 'empresa') THEN
    r := 'aluno';
  END IF;

  INSERT INTO public.profiles (
    user_id,
    role,
    name,
    email,
    cpf,
    telefone,
    curso,
    experiencia,
    empresa_nome
  )
  VALUES (
    NEW.id,
    r,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'cpf'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'telefone'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'curso'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'experiencia'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'empresa_nome'), '')
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Employers may read applicant profiles for their jobs
CREATE POLICY "profiles_select_applicants"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.user_id = profiles.user_id
        AND j.empresa_id = auth.uid()
    )
  );

-- Jobs: any authenticated user can read (MVP)
CREATE POLICY "jobs_select_authenticated"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "jobs_insert_empresa"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = empresa_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'empresa'
    )
  );

CREATE POLICY "jobs_update_own"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = empresa_id)
  WITH CHECK (auth.uid() = empresa_id);

CREATE POLICY "jobs_delete_own"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = empresa_id);

-- Applications
CREATE POLICY "applications_select_own_or_employer"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = applications.job_id AND j.empresa_id = auth.uid()
    )
  );

CREATE POLICY "applications_insert_aluno"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'aluno'
    )
  );

CREATE POLICY "applications_update_employer"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = applications.job_id AND j.empresa_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = applications.job_id AND j.empresa_id = auth.uid()
    )
  );

-- Storage: private bucket for CVs (create bucket in Dashboard named "curriculos" OR insert here)
INSERT INTO storage.buckets (id, name, public)
VALUES ('curriculos', 'curriculos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "curriculos_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'curriculos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Employer may read CV of users who applied to their jobs
CREATE POLICY "curriculos_select_employer_applicant"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'curriculos'
    AND EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE j.empresa_id = auth.uid()
        AND split_part(name, '/', 1) = a.user_id::text
    )
  );

CREATE POLICY "curriculos_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'curriculos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "curriculos_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'curriculos'
    AND split_part(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'curriculos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "curriculos_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'curriculos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
