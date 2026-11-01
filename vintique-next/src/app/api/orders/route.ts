import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// ?as=buyer (default) lists my purchases; ?as=seller lists my sales.
export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const asSeller = new URL(req.url).searchParams.get("as") === "seller";
  const orders = await prisma.order.findMany({
    where: asSeller ? { sellerId: user.id } : { buyerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      items: { include: { product: { select: { image: true } } } },
    },
  });
  return NextResponse.json(orders);
}
