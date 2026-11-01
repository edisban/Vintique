import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SHIPPING_PER_PARCEL } from "@/lib/catalog";

const str = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

class UnavailableError extends Error {
  constructor(public ids: number[]) {
    super("Some items are no longer available");
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const ids: number[] = Array.isArray(body?.productIds) ? [...new Set<number>(body.productIds.filter(Number.isInteger))] : [];
  const ship = {
    shipName: str(body?.shipping?.name),
    shipAddress: str(body?.shipping?.address, 200),
    shipCity: str(body?.shipping?.city),
    shipPostalCode: str(body?.shipping?.postalCode, 20),
    shipCountry: str(body?.shipping?.country),
  };
  if (ids.length === 0 || ids.length > 50) return NextResponse.json({ error: "Your bag is empty" }, { status: 400 });
  if (Object.values(ship).some((v) => !v)) return NextResponse.json({ error: "Please fill in your shipping details" }, { status: 400 });

  try {
    const orders = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: ids } } });
      const buyable = products.filter((p) => p.status === "AVAILABLE" && p.sellerId && p.sellerId !== user.id);
      if (buyable.length !== ids.length) {
        throw new UnavailableError(ids.filter((id) => !buyable.some((p) => p.id === id)));
      }

      // Claim the items. The status condition makes this safe against two buyers checking out
      // the same piece at once: the second transaction updates fewer rows and rolls back.
      const claimed = await tx.product.updateMany({ where: { id: { in: ids }, status: "AVAILABLE" }, data: { status: "SOLD" } });
      if (claimed.count !== ids.length) throw new UnavailableError(ids);

      // Payment would be taken here (e.g. a Stripe PaymentIntent). In test mode it always succeeds.

      const bySeller = Map.groupBy(buyable, (p) => p.sellerId!);
      return Promise.all(
        [...bySeller].map(([sellerId, items]) => {
          const itemsTotal = items.reduce((s, p) => s + p.price, 0);
          return tx.order.create({
            data: {
              buyerId: user.id,
              sellerId,
              itemsTotal,
              shipping: SHIPPING_PER_PARCEL,
              total: itemsTotal + SHIPPING_PER_PARCEL,
              ...ship,
              items: { create: items.map((p) => ({ productId: p.id, title: p.title, price: p.price })) },
            },
          });
        })
      );
    });
    return NextResponse.json({ orderIds: orders.map((o) => o.id) }, { status: 201 });
  } catch (e) {
    if (e instanceof UnavailableError) {
      return NextResponse.json({ error: "Some pieces in your bag are no longer available", unavailable: e.ids }, { status: 409 });
    }
    throw e;
  }
}
