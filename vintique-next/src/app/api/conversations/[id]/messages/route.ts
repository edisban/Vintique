import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const MAX_LENGTH = 2000;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const id = parseInt((await params).id);
  const body = await req.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  if (text.length > MAX_LENGTH) return NextResponse.json({ error: `Messages can be up to ${MAX_LENGTH} characters` }, { status: 400 });

  const conversation = id ? await prisma.conversation.findUnique({ where: { id } }) : null;
  if (!conversation || (conversation.buyerId !== user.id && conversation.sellerId !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { conversationId: id, senderId: user.id, body: text } }),
    // Bump updatedAt so the conversation moves to the top of both inboxes
    prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);
  return NextResponse.json(message, { status: 201 });
}
