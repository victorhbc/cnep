import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VagasClient } from "./vagas-client";

export default async function AlunoVagasPage() {
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

  if (profile?.role !== "aluno") redirect("/empresa/vagas");

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: applications } = await supabase
    .from("applications")
    .select("job_id")
    .eq("user_id", user.id);

  if (jobsError) {
    return (
      <p className="text-red-600">
        Erro ao carregar vagas: {jobsError.message}. Verifique o Supabase e as políticas RLS.
      </p>
    );
  }

  const appliedJobIds = new Set((applications ?? []).map((a) => a.job_id));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Vagas</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Filtre por tipo de função, candidate-se com um clique ou retire a candidatura quando quiser.
      </p>
      <div className="mt-8">
        <VagasClient
          jobs={jobs ?? []}
          appliedJobIds={appliedJobIds}
          userId={user.id}
        />
      </div>
    </div>
  );
}
