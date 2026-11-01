import { describe, expect, it, vi } from "vitest";
import { POST as checkout } from "@/app/api/checkout/route";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHIPPING_PER_PARCEL } from "@/lib/catalog";
import { actAs, createListing, createUser, request, SHIPPING } from "./helpers";

const buy = (productIds: number[], shipping: object = SHIPPING) => checkout(request("POST", "/api/checkout", { productIds, shipping }));

describe("checkout", () => {
  it("creates one order per seller with shipping per parcel, and marks the items sold", async () => {
    const [sam, sue, bea] = await Promise.all([createUser("Sam"), createUser("Sue"), createUser("Bea")]);
    const coat = await createListing(sam, { title: "Coat", price: 80 });
    const belt = await createListing(sam, { title: "Belt", price: 20 });
    const scarf = await createListing(sue, { title: "Scarf", price: 15 });
    actAs(bea);

    const res = await buy([coat.id, belt.id, scarf.id]);
    expect(res.status).toBe(201);
    expect((await res.json()).orderIds).toHaveLength(2);

    const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { total: "desc" } });
    expect(orders[0]).toMatchObject({ buyerId: bea.id, sellerId: sam.id, status: "PAID", itemsTotal: 100, shipping: SHIPPING_PER_PARCEL, total: 100 + SHIPPING_PER_PARCEL });
    expect(orders[0].items.map((i) => i.title).sort()).toEqual(["Belt", "Coat"]);
    expect(orders[1]).toMatchObject({ sellerId: sue.id, itemsTotal: 15 });

    const statuses = await prisma.product.findMany({ select: { status: true } });
    expect(statuses.every((p) => p.status === "SOLD")).toBe(true);
  });

  it("copies title and price into the order so it survives later edits", async () => {
    const sam = await createUser("Sam");
    const coat = await createListing(sam, { title: "Coat", price: 80 });
    actAs(await createUser("Bea"));
    await buy([coat.id]);

    await prisma.product.update({ where: { id: coat.id }, data: { title: "Renamed", price: 999 } });
    const item = await prisma.orderItem.findFirstOrThrow();
    expect(item).toMatchObject({ title: "Coat", price: 80 });
  });

  it("refuses sold items and the buyer's own listings, without creating any order", async () => {
    const sam = await createUser("Sam");
    const sold = await createListing(sam, { status: "SOLD" });
    const free = await createListing(sam);
    actAs(sam);

    const own = await buy([free.id]);
    expect(own.status).toBe(409);

    actAs(await createUser("Bea"));
    const res = await buy([free.id, sold.id]);
    expect(res.status).toBe(409);
    expect((await res.json()).unavailable).toEqual([sold.id]);
    expect(await prisma.order.count()).toBe(0);
    // The available item was not claimed by the failed checkout
    expect((await prisma.product.findUniqueOrThrow({ where: { id: free.id } })).status).toBe("AVAILABLE");
  });

  it("validates the request", async () => {
    const coat = await createListing(await createUser("Sam"));
    actAs(null);
    expect((await buy([coat.id])).status).toBe(401);

    actAs(await createUser("Bea"));
    expect((await buy([])).status).toBe(400);
    expect((await buy([coat.id], { ...SHIPPING, city: "" })).status).toBe(400);
  });

  it("sells an item only once when two buyers check out at the same moment", async () => {
    const coat = await createListing(await createUser("Sam"));
    const [ann, bob] = await Promise.all([createUser("Ann"), createUser("Bob")]);
    vi.mocked(getSessionUser)
      .mockResolvedValueOnce(ann as Awaited<ReturnType<typeof getSessionUser>>)
      .mockResolvedValueOnce(bob as Awaited<ReturnType<typeof getSessionUser>>);

    const results = await Promise.all([buy([coat.id]), buy([coat.id])]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(await prisma.order.count()).toBe(1);
  });
});
