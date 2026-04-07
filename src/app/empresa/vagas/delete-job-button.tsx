"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DeleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("Excluir esta vaga? As candidaturas associadas também serão removidas.")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("jobs").delete().eq("id", jobId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void remove()}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "…" : "Excluir"}
    </button>
  );
}
