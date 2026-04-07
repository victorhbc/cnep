"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { jobSchema, type JobFormValues } from "@/lib/validations/job";
import type { JobRow } from "@/types/database";
import { useState } from "react";

type Props = {
  mode: "create" | "edit";
  empresaId: string;
  empresaNome: string;
  job?: JobRow;
};

export function JobForm({ mode, empresaId, empresaNome, job }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: job
      ? {
          titulo: job.titulo,
          descricao: job.descricao,
          tipo_funcao: job.tipo_funcao,
        }
      : { titulo: "", descricao: "", tipo_funcao: "" },
  });

  async function onSubmit(values: JobFormValues) {
    setError(null);
    const supabase = createClient();
    if (mode === "create") {
      const { error: ins } = await supabase.from("jobs").insert({
        titulo: values.titulo,
        descricao: values.descricao,
        tipo_funcao: values.tipo_funcao,
        empresa_id: empresaId,
        empresa_nome: empresaNome,
      });
      if (ins) {
        setError(ins.message);
        return;
      }
    } else if (job) {
      const { error: upd } = await supabase
        .from("jobs")
        .update({
          titulo: values.titulo,
          descricao: values.descricao,
          tipo_funcao: values.tipo_funcao,
          empresa_nome: empresaNome,
        })
        .eq("id", job.id)
        .eq("empresa_id", empresaId);
      if (upd) {
        setError(upd.message);
        return;
      }
    }
    router.push("/empresa/vagas");
    router.refresh();
  }

  return (
    <form className="max-w-xl space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Título</label>
        <input
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          {...register("titulo")}
        />
        {errors.titulo ? (
          <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tipo de função</label>
        <input
          placeholder="Ex.: Operador de máquinas, Administrativo…"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          {...register("tipo_funcao")}
        />
        {errors.tipo_funcao ? (
          <p className="mt-1 text-sm text-red-600">{errors.tipo_funcao.message}</p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Descrição</label>
        <textarea
          rows={6}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          {...register("descricao")}
        />
        {errors.descricao ? (
          <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {isSubmitting ? "Salvando…" : mode === "create" ? "Publicar vaga" : "Salvar"}
        </button>
        <Link
          href="/empresa/vagas"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
