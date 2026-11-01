export type Seller = { id: string; name: string; createdAt: string };

export type Product = {
  id: number;
  title: string;
  brand: string;
  category: string;
  size: string;
  condition: string;
  price: number;
  description: string;
  image: string;
  status: "AVAILABLE" | "SOLD";
  sellerId: string | null;
  seller: Seller | null;
  createdAt: string;
};

type Party = { id: string; name: string };

export type Order = {
  id: number;
  status: "PAID" | "SHIPPED" | "COMPLETED";
  itemsTotal: number;
  shipping: number;
  total: number;
  shipName: string;
  shipAddress: string;
  shipCity: string;
  shipPostalCode: string;
  shipCountry: string;
  buyer: Party;
  seller: Party;
  items: { id: number; productId: number | null; title: string; price: number; product: { image: string } | null }[];
  createdAt: string;
};

export type Message = { id: number; senderId: string; body: string; readAt: string | null; createdAt: string };

export type Conversation = {
  id: number;
  buyerId: string;
  sellerId: string;
  buyer: Party;
  seller: Party;
  product: { id: number; title: string; image: string; price: number; status: string } | null;
  updatedAt: string;
};

export type ConversationSummary = Conversation & { lastMessage: Message | null; unread: number };
export type ConversationThread = Conversation & { messages: Message[] };
