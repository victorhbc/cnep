import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-sm text-zinc-500">Carregando…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
