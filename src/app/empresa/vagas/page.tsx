import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteJobButton } from "./delete-job-button";

export default async function EmpresaVagasPage() {
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

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("empresa_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-600">Erro ao carregar vagas: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Minhas vagas</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Publique oportunidades e acompanhe candidatos.
          </p>
        </div>
        <Link
          href="/empresa/vagas/nova"
          className="inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Nova vaga
        </Link>
      </div>

      <ul className="mt-8 space-y-3">
        {(jobs ?? []).length === 0 ? (
          <li className="rounded-xl border border-dashed border-zinc-300 px-4 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            Nenhuma vaga ainda.{" "}
            <Link className="font-medium text-emerald-700 hover:underline dark:text-emerald-400" href="/empresa/vagas/nova">
              Criar primeira vaga
            </Link>
          </li>
        ) : (
          (jobs ?? []).map((job) => (
            <li
              key={job.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{job.titulo}</h2>
                <p className="text-xs text-zinc-500">{job.tipo_funcao}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link
                  className="text-emerald-700 hover:underline dark:text-emerald-400"
                  href={`/empresa/vagas/${job.id}/candidatos`}
                >
                  Candidatos
                </Link>
                <Link
                  className="text-zinc-600 hover:underline dark:text-zinc-400"
                  href={`/empresa/vagas/${job.id}/editar`}
                >
                  Editar
                </Link>
                <DeleteJobButton jobId={job.id} />
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
