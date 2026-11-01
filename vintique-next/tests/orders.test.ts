import { beforeEach, describe, expect, it } from "vitest";
import { POST as checkout } from "@/app/api/checkout/route";
import { GET as listOrders } from "@/app/api/orders/route";
import { PATCH as updateOrder } from "@/app/api/orders/[id]/route";
import { actAs, createListing, createUser, params, request, SHIPPING } from "./helpers";

let seller: Awaited<ReturnType<typeof createUser>>;
let buyer: Awaited<ReturnType<typeof createUser>>;
let orderId: number;

const setStatus = (status: string) => updateOrder(request("PATCH", `/api/orders/${orderId}`, { status }), params(orderId));

beforeEach(async () => {
  seller = await createUser("Sam");
  buyer = await createUser("Bea");
  const coat = await createListing(seller);
  actAs(buyer);
  const res = await checkout(request("POST", "/api/checkout", { productIds: [coat.id], shipping: SHIPPING }));
  [orderId] = (await res.json()).orderIds;
});

describe("order status flow", () => {
  it("goes PAID → SHIPPED (seller) → COMPLETED (buyer)", async () => {
    actAs(seller);
    expect((await setStatus("SHIPPED")).status).toBe(200);
    actAs(buyer);
    expect((await setStatus("COMPLETED")).status).toBe(200);

    const [order] = await (await listOrders(request("GET", "/api/orders?as=buyer"))).json();
    expect(order.status).toBe("COMPLETED");
  });

  it("only lets each side make their own step", async () => {
    actAs(buyer);
    expect((await setStatus("SHIPPED")).status).toBe(403);
    actAs(await createUser("Mallory"));
    expect((await setStatus("SHIPPED")).status).toBe(403);
    actAs(seller);
    expect((await setStatus("COMPLETED")).status).toBe(403);
  });

  it("can't skip or repeat a step", async () => {
    actAs(buyer);
    expect((await setStatus("COMPLETED")).status).toBe(409); // not shipped yet
    actAs(seller);
    expect((await setStatus("SHIPPED")).status).toBe(200);
    expect((await setStatus("SHIPPED")).status).toBe(409); // already shipped
  });

  it("rejects unknown statuses", async () => {
    actAs(seller);
    expect((await setStatus("REFUNDED")).status).toBe(400);
  });
});

describe("listing orders", () => {
  it("shows purchases to the buyer and sales to the seller", async () => {
    actAs(buyer);
    expect(await (await listOrders(request("GET", "/api/orders?as=buyer"))).json()).toHaveLength(1);
    expect(await (await listOrders(request("GET", "/api/orders?as=seller"))).json()).toHaveLength(0);

    actAs(seller);
    const [sale] = await (await listOrders(request("GET", "/api/orders?as=seller"))).json();
    expect(sale).toMatchObject({ shipCity: SHIPPING.city, buyer: { name: "Bea" } });
  });
});
