import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobForm } from "../job-form";

export default async function NovaVagaPage() {
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

  const empresaNome = profile.empresa_nome?.trim() || "Empresa";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Nova vaga</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        A vaga será publicada em nome de <strong>{empresaNome}</strong>.
      </p>
      <div className="mt-8">
        <JobForm mode="create" empresaId={user.id} empresaNome={empresaNome} />
      </div>
    </div>
  );
}
