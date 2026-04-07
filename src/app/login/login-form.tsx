"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth";
import type { z } from "zod";
import { AuthCard } from "@/components/auth-card";

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    setError(null);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (signError) {
      setError(signError.message);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .maybeSingle();
    const dest =
      next && next.startsWith("/")
        ? next
        : profile?.role === "empresa"
          ? "/empresa/vagas"
          : "/aluno/vagas";
    router.push(dest);
    router.refresh();
  }

  return (
    <AuthCard
      title="Entrar"
      subtitle="Acesse sua conta CENEP Conecta com e-mail e senha."
    >
      {searchParams.get("error") === "auth" ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          Não foi possível concluir o login. Tente novamente.
        </p>
      ) : null}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          ) : null}
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {isSubmitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link className="text-emerald-700 hover:underline dark:text-emerald-400" href="/recuperar-senha">
          Esqueci minha senha
        </Link>
      </p>
      <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Não tem conta?{" "}
        <Link className="font-medium text-emerald-700 hover:underline dark:text-emerald-400" href="/cadastro">
          Cadastre-se
        </Link>
      </p>
    </AuthCard>
  );
}
