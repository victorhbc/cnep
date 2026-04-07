"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth-card";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
});

type Form = z.infer<typeof schema>;

export default function RecuperarSenhaPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/redefinir-senha")}`,
    });
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage("Se o e-mail existir, você receberá um link para redefinir a senha.");
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <AuthCard
        title="Recuperar senha"
        subtitle="Enviaremos um link para o e-mail cadastrado."
      >
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
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? (
            <p className="text-sm text-emerald-800 dark:text-emerald-200">{message}</p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmitting ? "Enviando…" : "Enviar link"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link className="text-emerald-700 hover:underline dark:text-emerald-400" href="/login">
            Voltar ao login
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
