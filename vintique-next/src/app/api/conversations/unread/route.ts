import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// Number of unread messages sent to me, for the header badge.
export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ count: 0 });
  const count = await prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: user.id },
      conversation: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    },
  });
  return NextResponse.json({ count });
}
