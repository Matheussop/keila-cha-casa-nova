"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminData, GiftItem, SiteSettings } from "@/lib/types";

type ItemDraft = {
  id: string;
  name: string;
  category: string;
  note: string;
  status: GiftItem["status"];
};

export function AdminDashboard({ initialData }: { initialData: AdminData }) {
  const router = useRouter();
  const [items, setItems] = useState(initialData.items);
  const [settings, setSettings] = useState(initialData.settings);
  const [newItem, setNewItem] = useState({ name: "", category: "", note: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const drafts = useMemo<Record<string, ItemDraft>>(
    () =>
      Object.fromEntries(
        items.map((item) => [
          item.id,
          {
            id: item.id,
            name: item.name,
            category: item.category,
            note: item.note,
            status: item.status,
          },
        ]),
      ),
    [items],
  );

  const [itemDrafts, setItemDrafts] = useState(drafts);

  const refreshDrafts = (nextItems: GiftItem[]) => {
    setItems(nextItems);
    setItemDrafts(
      Object.fromEntries(
        nextItems.map((item) => [
          item.id,
          {
            id: item.id,
            name: item.name,
            category: item.category,
            note: item.note,
            status: item.status,
          },
        ]),
      ),
    );
  };

  const handleLogout = () => {
    startTransition(async () => {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/acesso-keila");
      router.refresh();
    });
  };

  const handleCreateItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      const response = await fetch("/api/admin/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; item?: GiftItem } | null;

      if (!response.ok || !payload?.item) {
        setError(payload?.error ?? "Nao foi possivel criar o item.");
        return;
      }

      const nextItems = [payload.item, ...items];
      refreshDrafts(nextItems);
      setNewItem({ name: "", category: "", note: "" });
      setMessage("Item criado com sucesso.");
    });
  };

  const handleSaveItem = (itemId: string) => {
    const draft = itemDrafts[itemId];

    setError("");
    setMessage("");

    startTransition(async () => {
      const response = await fetch(`/api/admin/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; item?: GiftItem } | null;

      if (!response.ok || !payload?.item) {
        setError(payload?.error ?? "Nao foi possivel salvar o item.");
        return;
      }

      const updatedItem = payload.item;
      const nextItems = items.map((item) => (item.id === itemId ? updatedItem : item));
      refreshDrafts(nextItems);
      setMessage("Item atualizado.");
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setError("");
    setMessage("");

    startTransition(async () => {
      const response = await fetch(`/api/admin/items/${itemId}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Nao foi possivel excluir o item.");
        return;
      }

      const nextItems = items.filter((item) => item.id !== itemId);
      refreshDrafts(nextItems);
      setMessage("Item removido.");
    });
  };

  const handleSettingsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; settings?: SiteSettings } | null;

      if (!response.ok || !payload?.settings) {
        setError(payload?.error ?? "Nao foi possivel salvar as configuracoes.");
        return;
      }

      setSettings(payload.settings);
      setMessage("Configuracoes atualizadas.");
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
      <header className="glass-panel flex flex-col gap-6 rounded-[32px] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted">Area escondida</p>
          <h1 className="font-heading mt-3 text-5xl leading-none text-foreground">Painel administrativo</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
            Edite os itens do cha de casa nova, configure a chave Pix e personalize os textos exibidos no site.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-white/80 disabled:opacity-60"
        >
          Sair
        </button>
      </header>

      {initialData.setupRequired ? (
        <section className="rounded-[28px] border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Configure as variaveis do Supabase para salvar tudo online. Enquanto isso, o painel funciona apenas como referencia visual.
        </section>
      ) : null}

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <section className="grid gap-8 xl:grid-cols-[1.05fr_1.35fr]">
        <form onSubmit={handleSettingsSubmit} className="soft-card rounded-[32px] p-6 sm:p-8">
          <h2 className="font-heading text-4xl text-foreground">Conteudo do site</h2>
          <div className="mt-6 space-y-4">
            <Field label="Nome principal">
              <input
                value={settings.displayName}
                onChange={(event) => setSettings({ ...settings, displayName: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              />
            </Field>

            <Field label="Mensagem de abertura">
              <textarea
                value={settings.heroMessage}
                onChange={(event) => setSettings({ ...settings, heroMessage: event.target.value })}
                className="mt-2 min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              />
            </Field>

            <Field label="Mensagem final">
              <textarea
                value={settings.closingMessage}
                onChange={(event) => setSettings({ ...settings, closingMessage: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              />
            </Field>

            <Field label="Chave Pix">
              <input
                value={settings.pixKey}
                onChange={(event) => setSettings({ ...settings, pixKey: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
                placeholder="Voce pode preencher depois"
              />
            </Field>

            <Field label="Nome do favorecido no Pix">
              <input
                value={settings.pixHolderName}
                onChange={(event) => setSettings({ ...settings, pixHolderName: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              />
            </Field>

            <Field label="Mensagem do Pix">
              <textarea
                value={settings.pixMessage}
                onChange={(event) => setSettings({ ...settings, pixMessage: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
              />
            </Field>

            <Field label="Link do WhatsApp">
              <input
                value={settings.whatsAppLink}
                onChange={(event) => setSettings({ ...settings, whatsAppLink: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
                placeholder="https://wa.me/5511999999999"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
          >
            Salvar configuracoes
          </button>
        </form>

        <section className="space-y-6">
          <form onSubmit={handleCreateItem} className="soft-card rounded-[32px] p-6 sm:p-8">
            <h2 className="font-heading text-4xl text-foreground">Adicionar item</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Nome do item">
                <input
                  value={newItem.name}
                  onChange={(event) => setNewItem({ ...newItem, name: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Categoria">
                <input
                  value={newItem.category}
                  onChange={(event) => setNewItem({ ...newItem, category: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
                />
              </Field>
            </div>

            <Field label="Observacao">
              <textarea
                value={newItem.note}
                onChange={(event) => setNewItem({ ...newItem, note: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
                placeholder="Ex.: prefira branco ou inox"
              />
            </Field>

            <button
              type="submit"
              disabled={isPending}
              className="mt-6 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-92 disabled:opacity-60"
            >
              Criar item
            </button>
          </form>

          <div className="soft-card rounded-[32px] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading text-4xl text-foreground">Itens cadastrados</h2>
              <span className="text-sm text-muted">{items.length} itens</span>
            </div>

            <div className="mt-6 space-y-4">
              {items.map((item) => {
                const draft = itemDrafts[item.id];

                return (
                  <article key={item.id} className="rounded-[28px] border border-border bg-white/75 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Nome">
                        <input
                          value={draft?.name ?? ""}
                          onChange={(event) =>
                            setItemDrafts({
                              ...itemDrafts,
                              [item.id]: { ...draft, name: event.target.value },
                            })
                          }
                          className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
                        />
                      </Field>

                      <Field label="Categoria">
                        <input
                          value={draft?.category ?? ""}
                          onChange={(event) =>
                            setItemDrafts({
                              ...itemDrafts,
                              [item.id]: { ...draft, category: event.target.value },
                            })
                          }
                          className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
                        />
                      </Field>
                    </div>

                    <Field label="Observacao">
                      <textarea
                        value={draft?.note ?? ""}
                        onChange={(event) =>
                          setItemDrafts({
                            ...itemDrafts,
                            [item.id]: { ...draft, note: event.target.value },
                          })
                        }
                        className="mt-2 min-h-20 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
                      />
                    </Field>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
                      <span>
                        Status atual: <strong className="text-foreground">{item.status === "reserved" ? "Reservado" : "Disponivel"}</strong>
                      </span>
                      {item.reservedByName ? <span>Reservado por {item.reservedByName}</span> : null}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleSaveItem(item.id)}
                        disabled={isPending}
                        className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
                      >
                        Salvar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isPending}
                        className="rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60"
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block text-sm font-medium text-foreground">
      {label}
      {children}
    </label>
  );
}
