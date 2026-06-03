export type GiftItemStatus = "available" | "reserved";

export type GiftItem = {
  id: string;
  name: string;
  category: string;
  note: string;
  status: GiftItemStatus;
  reservedByName: string | null;
  reservedByWhatsApp: string | null;
};

export type SiteSettings = {
  displayName: string;
  heroMessage: string;
  closingMessage: string;
  pixKey: string;
  pixHolderName: string;
  pixMessage: string;
  whatsAppLink: string;
};

export type PublicData = {
  items: GiftItem[];
  settings: SiteSettings;
  setupRequired: boolean;
};

export type AdminData = PublicData;
