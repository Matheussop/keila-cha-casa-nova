import { defaultItems, defaultSettings } from "@/lib/default-data";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import type { AdminData, GiftItem, PublicData, SiteSettings } from "@/lib/types";

type ItemRow = {
  id: string;
  name: string;
  category: string;
  note: string | null;
  status: "available" | "reserved";
  reserved_by_name: string | null;
  reserved_by_whatsapp: string | null;
};

type SettingsRow = {
  display_name: string | null;
  hero_message: string | null;
  closing_message: string | null;
  pix_key: string | null;
  pix_holder_name: string | null;
  pix_message: string | null;
  whatsapp_link: string | null;
};

function mapItem(row: ItemRow): GiftItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    note: row.note ?? "",
    status: row.status,
    reservedByName: row.reserved_by_name,
    reservedByWhatsApp: row.reserved_by_whatsapp,
  };
}

function mapSettings(row: SettingsRow | null | undefined): SiteSettings {
  return {
    displayName: row?.display_name?.trim() || defaultSettings.displayName,
    heroMessage: row?.hero_message?.trim() || defaultSettings.heroMessage,
    closingMessage: row?.closing_message?.trim() || defaultSettings.closingMessage,
    pixKey: row?.pix_key?.trim() || "",
    pixHolderName: row?.pix_holder_name?.trim() || defaultSettings.pixHolderName,
    pixMessage: row?.pix_message?.trim() || defaultSettings.pixMessage,
    whatsAppLink: row?.whatsapp_link?.trim() || "",
  };
}

async function fetchItems(): Promise<GiftItem[]> {
  if (!isSupabaseConfigured()) {
    return defaultItems;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gift_items")
    .select("id, name, category, note, status, reserved_by_name, reserved_by_whatsapp")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapItem(row as ItemRow));
}

async function fetchSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) {
    return defaultSettings;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("display_name, hero_message, closing_message, pix_key, pix_holder_name, pix_message, whatsapp_link")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return mapSettings((data as SettingsRow | null) ?? null);
}

export async function getPublicData(): Promise<PublicData> {
  const [items, settings] = await Promise.all([fetchItems(), fetchSettings()]);

  return {
    items,
    settings,
    setupRequired: !isSupabaseConfigured(),
  };
}

export async function getAdminData(): Promise<AdminData> {
  return getPublicData();
}

export async function reserveGiftItem(input: {
  itemId: string;
  reservedByName: string;
  reservedByWhatsApp: string;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Configure o Supabase para salvar reservas online.");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gift_items")
    .update({
      status: "reserved",
      reserved_by_name: input.reservedByName,
      reserved_by_whatsapp: input.reservedByWhatsApp,
      reserved_at: new Date().toISOString(),
    })
    .eq("id", input.itemId)
    .eq("status", "available")
    .select("id, name, category, note, status, reserved_by_name, reserved_by_whatsapp")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Esse item ja foi reservado por outra pessoa.");
  }

  return mapItem(data as ItemRow);
}

export async function releaseGiftItem(input: {
  itemId: string;
  reservedByName: string;
  reservedByWhatsApp: string;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Configure o Supabase para salvar reservas online.");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gift_items")
    .update({
      status: "available",
      reserved_by_name: null,
      reserved_by_whatsapp: null,
      reserved_at: null,
    })
    .eq("id", input.itemId)
    .eq("status", "reserved")
    .eq("reserved_by_name", input.reservedByName)
    .eq("reserved_by_whatsapp", input.reservedByWhatsApp)
    .select("id, name, category, note, status, reserved_by_name, reserved_by_whatsapp")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Os dados informados nao correspondem a reserva atual.");
  }

  return mapItem(data as ItemRow);
}

export async function createGiftItem(input: { name: string; category: string; note: string }) {
  if (!isSupabaseConfigured()) {
    throw new Error("Configure o Supabase para salvar os itens online.");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gift_items")
    .insert({
      name: input.name,
      category: input.category,
      note: input.note,
      status: "available",
    })
    .select("id, name, category, note, status, reserved_by_name, reserved_by_whatsapp")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapItem(data as ItemRow);
}

export async function updateGiftItem(itemId: string, input: Record<string, unknown>) {
  if (!isSupabaseConfigured()) {
    throw new Error("Configure o Supabase para salvar os itens online.");
  }

  const updatePayload = Object.fromEntries(
    Object.entries({
      name: typeof input.name === "string" ? input.name.trim() : undefined,
      category: typeof input.category === "string" ? input.category.trim() : undefined,
      note: typeof input.note === "string" ? input.note.trim() : undefined,
    }).filter(([, value]) => value !== undefined),
  );

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gift_items")
    .update(updatePayload)
    .eq("id", itemId)
    .select("id, name, category, note, status, reserved_by_name, reserved_by_whatsapp")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapItem(data as ItemRow);
}

export async function deleteGiftItem(itemId: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("Configure o Supabase para salvar os itens online.");
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("gift_items").delete().eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSiteSettings(input: Record<string, unknown>) {
  if (!isSupabaseConfigured()) {
    throw new Error("Configure o Supabase para salvar as configuracoes online.");
  }

  const nextSettings = {
    id: 1,
    display_name: typeof input.displayName === "string" ? input.displayName.trim() : defaultSettings.displayName,
    hero_message: typeof input.heroMessage === "string" ? input.heroMessage.trim() : defaultSettings.heroMessage,
    closing_message:
      typeof input.closingMessage === "string" ? input.closingMessage.trim() : defaultSettings.closingMessage,
    pix_key: typeof input.pixKey === "string" ? input.pixKey.trim() : "",
    pix_holder_name:
      typeof input.pixHolderName === "string" ? input.pixHolderName.trim() : defaultSettings.pixHolderName,
    pix_message: typeof input.pixMessage === "string" ? input.pixMessage.trim() : defaultSettings.pixMessage,
    whatsapp_link: typeof input.whatsAppLink === "string" ? input.whatsAppLink.trim() : "",
  };

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .upsert(nextSettings)
    .select("display_name, hero_message, closing_message, pix_key, pix_holder_name, pix_message, whatsapp_link")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSettings(data as SettingsRow);
}
