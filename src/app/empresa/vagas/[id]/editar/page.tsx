import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobForm } from "../../job-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditarVagaPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, empresa_nome")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "empresa") redirect("/aluno/vagas");

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("empresa_id", user.id)
    .single();

  if (error || !job) notFound();

  const empresaNome = profile.empresa_nome?.trim() || job.empresa_nome || "Empresa";

  return (
    <div>
      <Link
        href="/empresa/vagas"
        className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
      >
        ← Voltar às vagas
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Editar vaga</h1>
      <div className="mt-8">
        <JobForm mode="edit" empresaId={user.id} empresaNome={empresaNome} job={job} />
      </div>
    </div>
  );
}
