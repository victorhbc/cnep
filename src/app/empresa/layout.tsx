import { SiteHeader } from "@/components/site-header";

export default function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader variant="empresa" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</main>
    </>
  );
}
