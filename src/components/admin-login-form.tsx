"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Nao foi possivel entrar.");
        return;
      }

      router.push("/acesso-keila/painel");
      router.refresh();
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="glass-panel w-full max-w-md rounded-[32px] p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-muted">Acesso administrativo</p>
        <h1 className="font-heading mt-4 text-5xl leading-none text-foreground">Painel da Keila</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Entre com a senha definida em <code>ADMIN_PASSWORD</code> para editar itens, Pix e mensagens.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-foreground"
              placeholder="Digite a senha"
            />
          </label>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
