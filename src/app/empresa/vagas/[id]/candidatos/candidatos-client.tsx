"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ApplicationStatus } from "@/types/database";

export type CandidatoRow = {
  applicationId: string;
  status: ApplicationStatus;
  created_at: string;
  name: string;
  email: string;
  telefone: string | null;
  curso: string | null;
  experiencia: string | null;
  curriculo_url: string | null;
};

const statusLabels: Record<ApplicationStatus, string> = {
  aplicado: "Aplicado",
  em_analise: "Em análise",
  aprovado: "Aprovado",
};

export function CandidatosClient({ candidatos }: { candidatos: CandidatoRow[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function setStatus(applicationId: string, status: ApplicationStatus) {
    setLoadingId(applicationId);
    const supabase = createClient();
    await supabase.from("applications").update({ status }).eq("id", applicationId);
    setLoadingId(null);
    router.refresh();
  }

  async function openCv(path: string | null) {
    if (!path) return;
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("curriculos").createSignedUrl(path, 120);
    if (error || !data?.signedUrl) return;
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  if (candidatos.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        Ainda não há candidaturas para esta vaga.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {candidatos.map((c) => (
        <li
          key={c.applicationId}
          className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{c.name}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{c.email}</p>
              {c.telefone ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{c.telefone}</p>
              ) : null}
              {c.curso ? (
                <p className="mt-2 text-sm">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">Curso: </span>
                  {c.curso}
                </p>
              ) : null}
              {c.experiencia ? (
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                  {c.experiencia}
                </p>
              ) : null}
              {c.curriculo_url ? (
                <button
                  type="button"
                  onClick={() => void openCv(c.curriculo_url)}
                  className="mt-2 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  Abrir currículo (PDF)
                </button>
              ) : (
                <p className="mt-2 text-xs text-zinc-500">Sem currículo enviado.</p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <label className="text-xs font-medium text-zinc-500">Status</label>
              <select
                value={c.status}
                disabled={loadingId === c.applicationId}
                onChange={(e) =>
                  void setStatus(c.applicationId, e.target.value as ApplicationStatus)
                }
                className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {(Object.keys(statusLabels) as ApplicationStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Candidatura em {new Date(c.created_at).toLocaleString("pt-BR")}
          </p>
        </li>
      ))}
    </ul>
  );
}
