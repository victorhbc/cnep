"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SiteHeader({
  variant,
}: {
  variant: "public" | "aluno" | "empresa";
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href={variant === "public" ? "/" : variant === "empresa" ? "/empresa/vagas" : "/aluno/vagas"}
          className="text-lg font-semibold tracking-tight text-emerald-800 dark:text-emerald-400"
        >
          CENEP Conecta
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {variant === "public" ? (
            <>
              <Link className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100" href="/login">
                Entrar
              </Link>
              <Link
                className="rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700"
                href="/cadastro"
              >
                Cadastrar
              </Link>
            </>
          ) : null}
          {variant === "aluno" ? (
            <>
              <Link
                className={`${pathname === "/aluno/vagas" ? "font-medium text-emerald-700 dark:text-emerald-400" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"}`}
                href="/aluno/vagas"
              >
                Vagas
              </Link>
              <Link
                className={`${pathname === "/aluno/perfil" ? "font-medium text-emerald-700 dark:text-emerald-400" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"}`}
                href="/aluno/perfil"
              >
                Perfil
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              >
                Sair
              </button>
            </>
          ) : null}
          {variant === "empresa" ? (
            <>
              <Link
                className={`${pathname?.startsWith("/empresa/vagas") ? "font-medium text-emerald-700 dark:text-emerald-400" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"}`}
                href="/empresa/vagas"
              >
                Minhas vagas
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              >
                Sair
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
