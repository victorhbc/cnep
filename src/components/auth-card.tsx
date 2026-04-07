export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </div>
  );
}
