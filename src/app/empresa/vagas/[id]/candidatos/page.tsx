import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CandidatosClient, type CandidatoRow } from "./candidatos-client";

type Props = { params: Promise<{ id: string }> };

export default async function CandidatosPage({ params }: Props) {
  const { id: jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "empresa") redirect("/aluno/vagas");

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, titulo, empresa_id")
    .eq("id", jobId)
    .single();

  if (jobError || !job || job.empresa_id !== user.id) notFound();

  const { data: applications, error: appError } = await supabase
    .from("applications")
    .select("id, user_id, status, created_at")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (appError) {
    return <p className="text-red-600">{appError.message}</p>;
  }

  const userIds = [...new Set((applications ?? []).map((a) => a.user_id))];
  const profilesMap = new Map<
    string,
    {
      name: string;
      email: string;
      telefone: string | null;
      curso: string | null;
      experiencia: string | null;
      curriculo_url: string | null;
    }
  >();

  if (userIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, name, email, telefone, curso, experiencia, curriculo_url")
      .in("user_id", userIds);

    (profs ?? []).forEach((p) => {
      profilesMap.set(p.user_id, {
        name: p.name,
        email: p.email,
        telefone: p.telefone,
        curso: p.curso,
        experiencia: p.experiencia,
        curriculo_url: p.curriculo_url,
      });
    });
  }

  const candidatos: CandidatoRow[] = (applications ?? []).map((a) => {
    const pr = profilesMap.get(a.user_id);
    return {
      applicationId: a.id,
      status: a.status as CandidatoRow["status"],
      created_at: a.created_at,
      name: pr?.name ?? "—",
      email: pr?.email ?? "—",
      telefone: pr?.telefone ?? null,
      curso: pr?.curso ?? null,
      experiencia: pr?.experiencia ?? null,
      curriculo_url: pr?.curriculo_url ?? null,
    };
  });

  return (
    <div>
      <Link
        href="/empresa/vagas"
        className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
      >
        ← Minhas vagas
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Candidatos</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Vaga: <strong>{job.titulo}</strong>
      </p>
      <div className="mt-8">
        <CandidatosClient candidatos={candidatos} />
      </div>
    </div>
  );
}
