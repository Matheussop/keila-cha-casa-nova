"use client";

import Image from "next/image";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { GiftItem, PublicData } from "@/lib/types";

type ItemFormState = {
  reservedByName: string;
  reservedByWhatsApp: string;
};

type FeedbackState = {
  type: "success" | "error";
  text: string;
};

export function GiftRegistryPage({ initialData }: { initialData: PublicData }) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<Record<string, ItemFormState>>({});
  const deferredSearch = useDeferredValue(search);

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(data.items.map((item) => item.category)))],
    [data.items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = deferredSearch.trim().toLowerCase();

    return data.items.filter((item) => {
      const matchesCategory = selectedCategory === "Todas" || item.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.note.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [data.items, deferredSearch, selectedCategory]);

  const refreshData = async () => {
    const nextData = await fetchLatestPublicData();

    if (!nextData) {
      return;
    }

    startTransition(() => setData(nextData));
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchLatestPublicData().then((nextData) => {
        if (!nextData) {
          return;
        }

        startTransition(() => setData(nextData));
      });
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => setFeedback(null), 4200);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const handleReserve = async (item: GiftItem) => {
    const currentForm = formState[item.id] ?? { reservedByName: "", reservedByWhatsApp: "" };
    setFeedback(null);
    setIsSubmitting(true);

    const response = await fetch("/api/items/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: item.id,
        reservedByName: currentForm.reservedByName,
        reservedByWhatsApp: currentForm.reservedByWhatsApp,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setFeedback({ type: "error", text: payload?.error ?? "Nao foi possivel reservar o item." });
      setIsSubmitting(false);
      return;
    }

    setFeedback({
      type: "success",
      text: `Reserva confirmada para ${item.name}. Obrigada pelo carinho.`,
    });
    setHighlightedItemId(item.id);
    setActiveItemId(null);
    setFormState({
      ...formState,
      [item.id]: { reservedByName: "", reservedByWhatsApp: "" },
    });
    await refreshData();
    setIsSubmitting(false);
  };

  const handleRelease = async (item: GiftItem) => {
    const currentForm = formState[item.id] ?? { reservedByName: "", reservedByWhatsApp: "" };
    setFeedback(null);
    setIsSubmitting(true);

    const response = await fetch("/api/items/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: item.id,
        reservedByName: currentForm.reservedByName,
        reservedByWhatsApp: currentForm.reservedByWhatsApp,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setFeedback({ type: "error", text: payload?.error ?? "Nao foi possivel liberar o item." });
      setIsSubmitting(false);
      return;
    }

    setFeedback({
      type: "success",
      text: `O item ${item.name} ficou disponivel novamente.`,
    });
    setHighlightedItemId(item.id);
    setActiveItemId(null);
    await refreshData();
    setIsSubmitting(false);
  };

  const copyPixKey = async () => {
    if (!data.settings.pixKey) {
      setFeedback({ type: "error", text: "Preencha a chave Pix no painel administrativo." });
      return;
    }

    await navigator.clipboard.writeText(data.settings.pixKey);
    setFeedback({ type: "success", text: "Chave Pix copiada." });
  };

  const updateItemForm = (itemId: string, changes: Partial<ItemFormState>) => {
    const currentForm = formState[itemId] ?? { reservedByName: "", reservedByWhatsApp: "" };

    setFormState({
      ...formState,
      [itemId]: { ...currentForm, ...changes },
    });
  };

  const reservedCount = data.items.filter((item) => item.status === "reserved").length;
  const availableCount = data.items.length - reservedCount;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
      <section className="glass-panel overflow-hidden rounded-[28px] sm:rounded-[36px]">
        <div className="grid gap-6 px-4 py-5 sm:px-8 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
          <div className="order-2 flex flex-col justify-between gap-6 lg:order-1 lg:gap-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted sm:text-sm sm:tracking-[0.34em]">Chá de casa nova</p>
              <h1 className="section-title mt-4 text-foreground">{data.settings.displayName}</h1>
              <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
                {data.settings.heroMessage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              <Metric label="Itens totais" value={String(data.items.length)} />
              <Metric label="Disponiveis" value={String(availableCount)} />
              <Metric label="Reservados" value={String(reservedCount)} className="col-span-2 sm:col-span-1" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#lista"
                className="w-full rounded-full bg-accent px-5 py-3.5 text-center text-sm font-semibold text-white hover:bg-accent-strong sm:w-auto"
              >
                Ver lista de presentes
              </a>
              {data.settings.whatsAppLink ? (
                <a
                  href={data.settings.whatsAppLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full rounded-full border border-border px-5 py-3.5 text-center text-sm font-semibold text-foreground hover:bg-white/80 sm:w-auto"
                >
                  Falar no WhatsApp
                </a>
              ) : null}
            </div>
          </div>

          <div className="order-1 relative min-h-[220px] overflow-hidden rounded-[24px] bg-[#ffcdb9] p-3 sm:min-h-[320px] sm:rounded-[32px] sm:p-4 lg:order-2 lg:min-h-[360px] lg:p-5">
            <Image
              src="/housewarming-hero.png"
              alt="Ilustracao decorativa de casa nova"
              fill
              priority
              className="object-contain object-center"
            />

            <StickerDecoration
              src="/66715.png"
              width={253}
              height={347}
              wrapperClassName="absolute right-2 top-2 rotate-[6deg] sm:right-3 sm:top-3 md:right-4 md:top-2 lg:right-2 lg:top-0"
              imageClassName="w-[58px] sm:w-[82px] md:w-[96px] lg:w-[104px]"
            />
          </div>
        </div>
      </section>

      {data.setupRequired ? (
        <section className="rounded-[28px] border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          O site ja esta pronto, mas ainda falta conectar o Supabase para salvar a lista online em tempo real.
        </section>
      ) : null}

      {feedback ? <FeedbackToast feedback={feedback} /> : null}

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div id="lista" className="soft-card rounded-[28px] p-4 sm:rounded-[32px] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted sm:text-sm sm:tracking-[0.28em]">Lista compartilhada</p>
              <h2 className="font-heading mt-3 text-[2.2rem] leading-none text-foreground sm:text-5xl">Escolha um presente</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.25fr_0.9fr]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-2xl border border-border bg-white px-4 py-3.5 text-sm sm:rounded-full"
                placeholder="Buscar item ou categoria"
              />

              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-2xl border border-border bg-white px-4 py-3.5 text-sm sm:rounded-full"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2">
            {filteredItems.map((item) => {
              const isActive = activeItemId === item.id;
              const currentForm = formState[item.id] ?? { reservedByName: "", reservedByWhatsApp: "" };
              const isHighlighted = highlightedItemId === item.id;

              return (
                <article
                  key={item.id}
                  className={`rounded-[24px] border bg-white/78 p-4 sm:rounded-[28px] sm:p-5 ${
                    isHighlighted
                      ? "border-accent/40 ring-2 ring-accent/20"
                      : "border-border"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div>
                      <span className="inline-flex rounded-full bg-[#ffdcd0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
                        {item.category}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold text-foreground sm:text-xl">{item.name}</h3>
                      {item.note ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{item.note}</p> : null}
                      {item.status === "reserved" && item.reservedByName ? (
                        <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-danger">
                          reservado por {item.reservedByName}
                        </p>
                      ) : null}
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {item.status === "available" ? (
                      <button
                        type="button"
                        onClick={() => setActiveItemId(isActive ? null : item.id)}
                        className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background hover:opacity-92 sm:w-auto sm:px-4 sm:py-2.5"
                      >
                        Quero presentear
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveItemId(isActive ? null : item.id)}
                        className="w-full rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-white sm:w-auto sm:px-4 sm:py-2.5"
                      >
                        Liberar item
                      </button>
                    )}
                  </div>

                  {isActive ? (
                    <div className="mt-5 rounded-[20px] bg-[#fff0e8] p-3.5 sm:rounded-[24px] sm:p-4">
                      <div className="grid gap-3">
                        <input
                          value={currentForm.reservedByName}
                          onChange={(event) => updateItemForm(item.id, { reservedByName: event.target.value })}
                          className="rounded-2xl border border-border bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm"
                          placeholder="Seu nome"
                          autoComplete="name"
                        />

                        <input
                          value={currentForm.reservedByWhatsApp}
                          onChange={(event) =>
                            updateItemForm(item.id, {
                              reservedByWhatsApp: formatWhatsApp(event.target.value),
                            })
                          }
                          className="rounded-2xl border border-border bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm"
                          placeholder="(11) 99999-9999"
                          autoComplete="tel"
                          inputMode="tel"
                        />

                        {item.status === "available" ? (
                          <button
                            type="button"
                            onClick={() => void handleReserve(item)}
                            disabled={isSubmitting}
                            className="rounded-full bg-accent px-4 py-3.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
                          >
                            {isSubmitting ? "Salvando..." : "Confirmar reserva"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleRelease(item)}
                            disabled={isSubmitting}
                            className="rounded-full border border-border bg-white px-4 py-3.5 text-sm font-semibold text-foreground hover:bg-white disabled:opacity-60"
                          >
                            {isSubmitting ? "Atualizando..." : "Desmarcar este item"}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {filteredItems.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-border px-5 py-8 text-center text-sm text-muted">
              Nenhum item encontrado com esse filtro.
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="soft-card relative overflow-hidden rounded-[28px] p-4 pr-20 sm:rounded-[32px] sm:p-8 sm:pr-24">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted sm:text-sm sm:tracking-[0.28em]">Contribuicao via Pix</p>
            <h2 className="font-heading mt-3 text-[2rem] leading-none text-foreground sm:text-4xl">Se preferir transferir</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{data.settings.pixMessage}</p>

            <StickerDecoration
              src="/51470.png"
              width={293}
              height={320}
              wrapperClassName="absolute right-2 top-3 rotate-[12deg] sm:right-3 sm:top-4 md:right-4 md:top-5 lg:right-3 lg:top-4"
              imageClassName="w-[80px] sm:w-[72px] md:w-[82px] lg:w-[90px] opacity-90"
            />

            <div className="mt-6 rounded-[20px] border border-border bg-white px-4 py-4 sm:rounded-[24px]">
              <p className="mt-2 text-base font-semibold text-foreground">
                {data.settings.pixHolderName || "Preencha no painel administrativo"}
              </p>

              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">Chave Pix</p>
              <p className="mt-2 break-all text-sm leading-6 text-foreground">
                {data.settings.pixKey || "Voce pode adicionar a chave depois no painel escondido."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void copyPixKey()}
              className="mt-5 w-full rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-white hover:bg-accent-strong"
            >
              Copiar chave Pix
            </button>
          </section>

          <section className="soft-card relative overflow-hidden rounded-[28px] p-4 pb-20 sm:rounded-[32px] sm:p-8 sm:pb-24">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted sm:text-sm sm:tracking-[0.28em]">Agradecimento</p>
            <h2 className="font-heading mt-3 text-[2rem] leading-none text-foreground sm:text-4xl">Com carinho</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{data.settings.closingMessage}</p>

            <StickerDecoration
              src="/31501.png"
              width={258}
              height={307}
              wrapperClassName="absolute bottom-2 right-2 -rotate-[8deg] sm:bottom-3 sm:right-4 md:bottom-4 md:right-4 lg:bottom-3 lg:right-4"
              imageClassName="w-[48px] sm:w-[68px] md:w-[78px] lg:w-[84px] opacity-90"
            />
          </section>
        </aside>
      </section>
    </main>
  );
}

function FeedbackToast({ feedback }: { feedback: FeedbackState }) {
  const classes =
    feedback.type === "success"
      ? "border-[#cfe0ce] bg-[#f3f8f1] text-success"
      : "border-[#efb2a2] bg-[#ffefea] text-danger";

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-6 sm:bottom-6">
      <div
        className={`pointer-events-auto w-full max-w-md rounded-[24px] border px-4 py-3 shadow-[0_18px_40px_rgba(153,85,57,0.16)] backdrop-blur ${classes}`}
      >
        <p className="text-sm font-semibold">{feedback.type === "success" ? "Tudo certo" : "Atencao"}</p>
        <p className="mt-1 text-sm leading-6">{feedback.text}</p>
      </div>
    </div>
  );
}

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

async function fetchLatestPublicData() {
  const response = await fetch("/api/public-data", { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as PublicData;
}

function Metric({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-[22px] border border-border bg-white/70 px-4 py-4 sm:rounded-[26px] sm:px-5 sm:py-5 ${className}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{value}</p>
    </div>
  );
}

function StickerDecoration({
  src,
  width,
  height,
  wrapperClassName = "",
  imageClassName = "",
}: {
  src: string;
  width: number;
  height: number;
  wrapperClassName?: string;
  imageClassName?: string;
}) {
  return (
    <div
      className={`pointer-events-none flex items-center justify-center rounded-2xl p-0.5 sm:rounded-3xl sm:p-1 ${wrapperClassName}`}
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        aria-hidden="true"
        className={`h-auto ${imageClassName}`}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: GiftItem["status"] }) {
  const label = status === "reserved" ? "Reservado" : "Disponivel";
  const classes =
    status === "reserved"
      ? "bg-[#ffd9cf] text-danger"
      : "bg-[#e4efe2] text-success";

  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${classes}`}>
      {label}
    </span>
  );
}
