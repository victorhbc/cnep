import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader variant="public" />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-10 px-4 py-20">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            CENEP
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Conecta empregabilidade
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Plataforma para alunos divulgarem perfil e currículo e para empresas publicarem vagas e
            acompanharem candidatos — MVP simples, rápido de validar.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-center font-medium text-white transition hover:bg-emerald-700"
          >
            Começar agora
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-6 py-3 font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Já tenho conta
          </Link>
        </div>
        <ul className="grid gap-6 border-t border-zinc-200 pt-10 dark:border-zinc-800 sm:grid-cols-2">
          <li>
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Alunos</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Perfil, curso, experiência, currículo em PDF e candidatura a vagas com filtro por função.
            </p>
          </li>
          <li>
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Empresas</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Cadastro, publicação de vagas e visualização de candidatos com status da triagem.
            </p>
          </li>
        </ul>
      </main>
    </>
  );
}
