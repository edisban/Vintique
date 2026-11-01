import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const party = { select: { id: true, name: true } } as const;

// My inbox: every conversation I'm part of, newest activity first, with the last message and unread count.
export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      buyer: party,
      seller: party,
      product: { select: { id: true, title: true, image: true, price: true, status: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { senderId: { not: user.id }, readAt: null } } } },
    },
  });
  return NextResponse.json(
    conversations.map(({ messages, _count, ...c }) => ({ ...c, lastMessage: messages[0] ?? null, unread: _count.messages }))
  );
}

// Start (or reopen) a conversation with the seller of a listing.
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const productId = Number(body?.productId);
  const product = Number.isInteger(productId) ? await prisma.product.findUnique({ where: { id: productId } }) : null;
  if (!product?.sellerId) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (product.sellerId === user.id) return NextResponse.json({ error: "This is your own listing" }, { status: 400 });

  const conversation = await prisma.conversation.upsert({
    where: { productId_buyerId: { productId, buyerId: user.id } },
    create: { productId, buyerId: user.id, sellerId: product.sellerId },
    update: {},
  });
  return NextResponse.json({ id: conversation.id });
}
