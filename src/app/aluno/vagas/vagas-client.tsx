"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JobRow } from "@/types/database";

type Props = {
  jobs: JobRow[];
  appliedJobIds: Set<string>;
  userId: string;
};

export function VagasClient({ jobs, appliedJobIds: initialApplied, userId }: Props) {
  const [filter, setFilter] = useState("");
  const [applied, setApplied] = useState(initialApplied);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tipos = useMemo(() => {
    const s = new Set<string>();
    jobs.forEach((j) => s.add(j.tipo_funcao));
    return Array.from(s).sort();
  }, [jobs]);

  const filtered = useMemo(() => {
    if (!filter) return jobs;
    return jobs.filter((j) => j.tipo_funcao === filter);
  }, [jobs, filter]);

  async function candidatar(jobId: string) {
    setError(null);
    setLoadingId(jobId);
    const supabase = createClient();
    const { error: insError } = await supabase.from("applications").insert({
      job_id: jobId,
      user_id: userId,
      status: "aplicado",
    });
    setLoadingId(null);
    if (insError) {
      setError(insError.message);
      return;
    }
    setApplied((prev) => new Set(prev).add(jobId));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Filtrar por tipo de função
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <ul className="space-y-4">
        {filtered.length === 0 ? (
          <li className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
            Nenhuma vaga encontrada.
          </li>
        ) : (
          filtered.map((job) => {
            const ja = applied.has(job.id);
            return (
              <li
                key={job.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {job.titulo}
                    </h2>
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      {job.empresa_nome || "Empresa"}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {job.tipo_funcao}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={ja || loadingId === job.id}
                    onClick={() => void candidatar(job.id)}
                    className="mt-2 shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0"
                  >
                    {ja ? "Candidatura enviada" : loadingId === job.id ? "Enviando…" : "Candidatar-se"}
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                  {job.descricao}
                </p>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
