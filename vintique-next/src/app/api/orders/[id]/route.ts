import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// Allowed status changes: the seller ships a paid order, the buyer confirms a shipped one.
const TRANSITIONS: Record<string, { from: string; by: "seller" | "buyer" }> = {
  SHIPPED: { from: "PAID", by: "seller" },
  COMPLETED: { from: "SHIPPED", by: "buyer" },
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const id = parseInt((await params).id);
  const body = await req.json().catch(() => null);
  const rule = TRANSITIONS[body?.status];
  if (!id || !rule) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const actor = rule.by === "seller" ? order.sellerId : order.buyerId;
  if (actor !== user.id) return NextResponse.json({ error: `Only the ${rule.by} can do this` }, { status: 403 });

  // Conditional update so a double click or stale page can't skip a step
  const { count } = await prisma.order.updateMany({ where: { id, status: rule.from }, data: { status: body.status } });
  if (!count) {
    const message = rule.by === "buyer" ? "You can confirm receipt once the seller has shipped" : "This order has already been shipped";
    return NextResponse.json({ error: message }, { status: 409 });
  }
  return NextResponse.json({ id, status: body.status });
}
