import type { GiftItem, SiteSettings } from "@/lib/types";

export const defaultSettings: SiteSettings = {
  displayName: "Keila",
  heroMessage:
    "Que alegria ter voce por aqui. Montei esta lista com algumas sugestoes para o meu cha de casa nova. Se escolher um item, ele fica reservado para evitar repeticao e deixar tudo organizado para todos.",
  closingMessage:
    "Sua presenca, carinho e lembranca ja significam muito para mim. Obrigada por fazer parte deste momento tao especial.",
  pixKey: "",
  pixHolderName: "Keila",
  pixMessage:
    "Se for mais pratico, voce tambem pode contribuir por Pix. Assim eu consigo complementar itens da casa conforme as necessidades do dia a dia.",
  whatsAppLink: "",
};

export const defaultItems: GiftItem[] = [
  { id: "default-1", name: "Jogo de pratos rasos", category: "Cozinha", note: "Conjunto com 6 pecas", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-2", name: "Jogo de copos", category: "Cozinha", note: "6 copos de vidro", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-3", name: "Faqueiro", category: "Cozinha", note: "24 pecas", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-4", name: "Panela media antiaderente", category: "Cozinha", note: "Pode ser com tampa", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-5", name: "Jogo de potes", category: "Cozinha", note: "Preferencia por potes com tampa", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-6", name: "Toalhas de banho", category: "Banheiro", note: "Jogo com 2 unidades", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-7", name: "Tapete para banheiro", category: "Banheiro", note: "Tom neutro", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-8", name: "Jogo de cama casal", category: "Quarto", note: "Lencol e fronhas", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-9", name: "Travesseiros", category: "Quarto", note: "Par de travesseiros", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-10", name: "Manta para sofa", category: "Sala", note: "Tecido leve", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-11", name: "Almofadas decorativas", category: "Sala", note: "Duas unidades", status: "available", reservedByName: null, reservedByWhatsApp: null },
  { id: "default-12", name: "Cesto organizador", category: "Organizacao", note: "Pode ser em fibra ou tecido", status: "available", reservedByName: null, reservedByWhatsApp: null },
];
