"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth-card";

const schema = z
  .object({
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirm: z.string().min(6, "Confirme a senha"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type Form = z.infer<typeof schema>;

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: values.password,
    });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <AuthCard title="Nova senha" subtitle="Defina uma nova senha para sua conta.">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nova senha
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
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Confirmar senha
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              {...register("confirm")}
            />
            {errors.confirm ? (
              <p className="mt-1 text-sm text-red-600">{errors.confirm.message}</p>
            ) : null}
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmitting ? "Salvando…" : "Salvar senha"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link className="text-emerald-700 hover:underline dark:text-emerald-400" href="/login">
            Ir para o login
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
