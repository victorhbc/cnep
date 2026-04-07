"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { AuthCard } from "@/components/auth-card";

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "aluno",
      name: "",
      email: "",
      password: "",
      telefone: "",
      curso: "",
      experiencia: "",
      cpf: "",
      empresa_nome: "",
    } as SignupInput,
  });

  const [roleTab, setRoleTab] = useState<"aluno" | "empresa">("aluno");
  useEffect(() => {
    setValue("role", roleTab);
  }, [roleTab, setValue]);

  const fe = errors as Record<string, { message?: string } | undefined>;

  async function onSubmit(values: SignupInput) {
    setError(null);
    const supabase = createClient();
    const meta: Record<string, string> = {
      name: values.name,
      role: values.role,
    };
    if (values.role === "aluno") {
      meta.telefone = values.telefone;
      meta.curso = values.curso;
      if (values.experiencia) meta.experiencia = values.experiencia;
      if (values.cpf) meta.cpf = values.cpf;
    } else {
      meta.empresa_nome = values.empresa_nome;
    }

    const { data, error: signError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: meta },
    });

    if (signError) {
      setError(signError.message);
      return;
    }

    if (data.session) {
      router.push(values.role === "empresa" ? "/empresa/vagas" : "/aluno/perfil");
      router.refresh();
    } else {
      setError(
        "Verifique seu e-mail para confirmar a conta antes de entrar (se a confirmação estiver ativa no Supabase).",
      );
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <AuthCard title="Criar conta" subtitle="Escolha o tipo de perfil e preencha os dados.">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setRoleTab("aluno")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                roleTab === "aluno"
                  ? "bg-white text-zinc-900 shadow dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              Aluno
            </button>
            <button
              type="button"
              onClick={() => setRoleTab("empresa")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                roleTab === "empresa"
                  ? "bg-white text-zinc-900 shadow dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              Empresa
            </button>
          </div>
          <input type="hidden" {...register("role")} />

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nome completo
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              {...register("name")}
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              E-mail
            </label>
            <input
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              {...register("email")}
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Senha
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              {...register("password")}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          {roleTab === "aluno" ? (
            <>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Telefone
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  {...register("telefone")}
                />
                {fe.telefone ? (
                  <p className="mt-1 text-sm text-red-600">{fe.telefone.message}</p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Curso no CENEP
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  {...register("curso")}
                />
                {fe.curso ? (
                  <p className="mt-1 text-sm text-red-600">{fe.curso.message}</p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Experiência (opcional)
                </label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  {...register("experiencia")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  CPF (opcional)
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  {...register("cpf")}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nome da empresa
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                {...register("empresa_nome")}
              />
              {fe.empresa_nome ? (
                <p className="mt-1 text-sm text-red-600">{fe.empresa_nome.message}</p>
              ) : null}
            </div>
          )}

          {error ? (
            <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmitting ? "Criando…" : "Cadastrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Já tem conta?{" "}
          <Link className="font-medium text-emerald-700 hover:underline dark:text-emerald-400" href="/login">
            Entrar
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
