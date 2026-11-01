import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const party = { select: { id: true, name: true } } as const;

// One conversation with its messages. Opening it marks the other person's messages as read.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const id = parseInt((await params).id);
  const conversation = id
    ? await prisma.conversation.findUnique({
        where: { id },
        include: {
          buyer: party,
          seller: party,
          product: { select: { id: true, title: true, image: true, price: true, status: true } },
          messages: { orderBy: { createdAt: "asc" }, take: 500 },
        },
      })
    : null;
  // Same 404 for "doesn't exist" and "not yours", so ids can't be probed
  if (!conversation || (conversation.buyerId !== user.id && conversation.sellerId !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.message.updateMany({ where: { conversationId: id, senderId: { not: user.id }, readAt: null }, data: { readAt: new Date() } });
  return NextResponse.json(conversation);
}
