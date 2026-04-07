"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { profileAlunoSchema, type ProfileAlunoForm } from "@/lib/validations/profile";
import type { ProfileRow } from "@/types/database";

export function PerfilForm({ profile }: { profile: ProfileRow }) {
  const [fileMsg, setFileMsg] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileAlunoForm>({
    resolver: zodResolver(profileAlunoSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      telefone: profile.telefone ?? "",
      curso: profile.curso ?? "",
      experiencia: profile.experiencia ?? "",
      cpf: profile.cpf ?? "",
    },
  });

  async function onSubmit(values: ProfileAlunoForm) {
    setSaveMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        name: values.name,
        email: values.email,
        telefone: values.telefone,
        curso: values.curso,
        experiencia: values.experiencia || null,
        cpf: values.cpf || null,
      })
      .eq("user_id", profile.user_id);
    if (error) {
      setSaveMsg(error.message);
      return;
    }
    setSaveMsg("Dados salvos.");
  }

  async function onPdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setFileMsg("Envie apenas arquivo PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileMsg("Máximo 5 MB.");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      setFileMsg("Sessão expirada.");
      return;
    }
    const safeName = file.name.replace(/[^\w.\-]/g, "_");
    const path = `${user.id}/${Date.now()}-${safeName}`;
    const { error: upError } = await supabase.storage.from("curriculos").upload(path, file, {
      upsert: true,
      contentType: "application/pdf",
    });
    if (upError) {
      setFileMsg(upError.message);
      setUploading(false);
      return;
    }
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ curriculo_url: path })
      .eq("user_id", user.id);
    setUploading(false);
    if (dbError) {
      setFileMsg(dbError.message);
      return;
    }
    setFileMsg("Currículo enviado com sucesso.");
    e.target.value = "";
  }

  async function downloadCv() {
    if (!profile.curriculo_url) return;
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("curriculos")
      .createSignedUrl(profile.curriculo_url, 120);
    if (error || !data?.signedUrl) return;
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-10">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            {...register("name")}
          />
          {errors.name ? <p className="mt-1 text-sm text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">E-mail</label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Telefone</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            {...register("telefone")}
          />
          {errors.telefone ? (
            <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Curso no CENEP
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            {...register("curso")}
          />
          {errors.curso ? (
            <p className="mt-1 text-sm text-red-600">{errors.curso.message}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Experiência</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            {...register("experiencia")}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">CPF (opcional)</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            {...register("cpf")}
          />
        </div>
        {saveMsg ? (
          <p
            className={`text-sm ${saveMsg === "Dados salvos." ? "text-emerald-700 dark:text-emerald-400" : "text-red-600"}`}
          >
            {saveMsg}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {isSubmitting ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>

      <section className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Currículo (PDF)</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {profile.curriculo_url
            ? "Você já enviou um currículo. Pode substituir enviando outro arquivo."
            : "Envie seu currículo em PDF (até 5 MB)."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900">
            {uploading ? "Enviando…" : "Escolher PDF"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={uploading}
              onChange={(e) => void onPdfChange(e)}
            />
          </label>
          {profile.curriculo_url ? (
            <button
              type="button"
              onClick={() => void downloadCv()}
              className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Baixar / visualizar
            </button>
          ) : null}
        </div>
        {fileMsg ? <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{fileMsg}</p> : null}
      </section>
    </div>
  );
}
