import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PerfilForm } from "./perfil-form";

export default async function AlunoPerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !profile) {
    return (
      <p className="text-red-600">
        Não foi possível carregar o perfil. Confirme se a migration do Supabase foi aplicada.
      </p>
    );
  }

  if (profile.role !== "aluno") redirect("/empresa/vagas");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Meu perfil</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Atualize seus dados e envie seu currículo em PDF.
      </p>
      <div className="mt-8">
        <PerfilForm profile={profile} />
      </div>
    </div>
  );
}
